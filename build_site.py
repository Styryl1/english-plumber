#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import re
from pathlib import Path
from typing import Any, Dict, List
from urllib.parse import urljoin

INPUT_PATH = Path("layout.builder (1).json")
OUTPUT_PATH = Path("index.from-json.html")
LIVE_SITE_URL = "https://www.gogeviti.com/"

VOID_TAGS = {
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
}

BREAKPOINT_QUERIES = {
    "medium": "(max-width: 991px)",
    "small": "(max-width: 640px)",
    "xsmall": "(max-width: 480px)",
}

TAG_STRIPPER = re.compile(r"<[^>]*>")
HTML_CLASS_PATTERN = re.compile(r"<html[^>]*\sclass=\"([^\"]+)\"", re.IGNORECASE)
BODY_CLASS_PATTERN = re.compile(r"<body[^>]*\sclass=\"([^\"]+)\"", re.IGNORECASE)
STYLESHEET_PATTERN = re.compile(
    r"<link[^>]+rel=\"stylesheet\"[^>]+href=\"([^\"]+)\"",
    re.IGNORECASE,
)

DROP_STYLE_KEYS = {
    "outline",
    "outlineColor",
    "outlineOffset",
    "outlineStyle",
    "outlineWidth",
    "textDecorationColor",
    "textEmphasisColor",
}

DROP_FONT_FAMILIES = {
    '"Times New Roman"',
    "Arial, Helvetica, sans-serif",
}

FALLBACK_HTML_CLASS = "__variable_e4fffa __variable_528cae __variable_3057fb"
FALLBACK_BODY_CLASS = "font-aspekta"
FALLBACK_STYLESHEET_URLS = [
    "https://www.gogeviti.com/_next/static/css/c166d0121e54d56c.css?dpl=dpl_Dr9PCzXjGVYsy4rPKKwmrBjrTwpK",
    "https://www.gogeviti.com/_next/static/css/2da20e92923ef490.css?dpl=dpl_Dr9PCzXjGVYsy4rPKKwmrBjrTwpK",
    "https://www.gogeviti.com/_next/static/css/b808377ec36a43ee.css?dpl=dpl_Dr9PCzXjGVYsy4rPKKwmrBjrTwpK",
    "https://www.gogeviti.com/_next/static/css/d61da687db648e05.css?dpl=dpl_Dr9PCzXjGVYsy4rPKKwmrBjrTwpK",
    "https://www.gogeviti.com/critical-mobile.css",
]


def camel_to_kebab(name: str) -> str:
    if "-" in name:
        return name

    chars: List[str] = []
    for ch in name:
        if ch.isupper():
            chars.append("-")
            chars.append(ch.lower())
        else:
            chars.append(ch)
    return "".join(chars)


def style_dict_to_css(style: Dict[str, str]) -> str:
    parts: List[str] = []
    for key, value in style.items():
        if value is None:
            continue
        parts.append(f"{camel_to_kebab(key)}:{value}")
    if not parts:
        return ""
    return ";".join(parts) + ";"


def render_attrs(attrs: Dict[str, str]) -> str:
    chunks: List[str] = []
    for key, value in attrs.items():
        escaped_key = html.escape(str(key), quote=True)
        if value is None:
            continue
        if value == "":
            chunks.append(f" {escaped_key}")
            continue
        escaped_value = html.escape(str(value), quote=True)
        chunks.append(f' {escaped_key}="{escaped_value}"')
    return "".join(chunks)


def strip_tags(value: str) -> str:
    return TAG_STRIPPER.sub("", value)


def uniq_keep_order(items: List[str]) -> List[str]:
    seen = set()
    out: List[str] = []
    for item in items:
        if item in seen:
            continue
        seen.add(item)
        out.append(item)
    return out


def fetch_live_site_metadata() -> Dict[str, Any]:
    metadata: Dict[str, Any] = {
        "html_class": FALLBACK_HTML_CLASS,
        "body_class": FALLBACK_BODY_CLASS,
        "stylesheet_urls": FALLBACK_STYLESHEET_URLS.copy(),
    }

    source_html = ""
    try:
        import requests  # type: ignore

        response = requests.get(LIVE_SITE_URL, timeout=15)
        response.raise_for_status()
        source_html = response.text
    except Exception:
        return metadata

    html_class_match = HTML_CLASS_PATTERN.search(source_html)
    body_class_match = BODY_CLASS_PATTERN.search(source_html)

    if html_class_match:
        metadata["html_class"] = html_class_match.group(1).strip()
    if body_class_match:
        metadata["body_class"] = body_class_match.group(1).strip()

    stylesheet_hrefs = STYLESHEET_PATTERN.findall(source_html)
    stylesheet_urls = [urljoin(LIVE_SITE_URL, href) for href in stylesheet_hrefs]
    metadata["stylesheet_urls"] = uniq_keep_order(stylesheet_urls)

    if not metadata["stylesheet_urls"]:
        metadata["stylesheet_urls"] = FALLBACK_STYLESHEET_URLS.copy()

    return metadata


def collect_title_text(node: Dict[str, Any]) -> str:
    out: List[str] = []

    def walk(current: Dict[str, Any]) -> None:
        component = current.get("component") or {}
        if component.get("name") == "Text":
            text_value = component.get("options", {}).get("text", "")
            if text_value:
                out.append(strip_tags(text_value))
        for child in current.get("children") or []:
            if isinstance(child, dict):
                walk(child)

    walk(node)
    title = "".join(out).strip()
    return title or "Builder Page"


class Renderer:
    def __init__(self, live_metadata: Dict[str, Any]) -> None:
        self.class_counter = 0
        self.media_rules: Dict[str, List[str]] = {
            bp: [] for bp in BREAKPOINT_QUERIES
        }
        self.live_metadata = live_metadata

    def next_class_name(self) -> str:
        self.class_counter += 1
        return f"bp-{self.class_counter}"

    def apply_responsive_styles(
        self,
        node: Dict[str, Any],
        attrs: Dict[str, str],
    ) -> None:
        styles = node.get("responsiveStyles") or {}
        large_styles_raw = styles.get("large") or {}

        tag_name = (node.get("tagName") or "").strip().lower()
        large_styles = self.filter_styles(tag_name, large_styles_raw)
        large_css = style_dict_to_css(large_styles)
        if large_css:
            attrs["style"] = large_css

        class_name: str | None = None
        for bp, query in BREAKPOINT_QUERIES.items():
            bp_styles_raw = styles.get(bp) or {}
            bp_styles = self.filter_styles(tag_name, bp_styles_raw)
            if not bp_styles:
                continue
            if class_name is None:
                class_name = self.next_class_name()
                existing = attrs.get("class", "")
                attrs["class"] = f"{existing} {class_name}".strip()

            bp_css = style_dict_to_css(bp_styles)
            if bp_css:
                self.media_rules[bp].append(f".{class_name}{{{bp_css}}}")

    def filter_styles(self, tag_name: str, style: Dict[str, str]) -> Dict[str, str]:
        filtered: Dict[str, str] = {}
        for key, value in style.items():
            if key in DROP_STYLE_KEYS:
                continue
            if key == "fontFamily" and value in DROP_FONT_FAMILIES:
                continue
            if tag_name in {"html", "head", "title"}:
                # Root/head/title visual styles are export artifacts.
                continue
            filtered[key] = value
        return filtered

    def build_base_attrs(
        self,
        node: Dict[str, Any],
        component_name: str,
    ) -> Dict[str, str]:
        attrs: Dict[str, str] = {}
        properties = node.get("properties") or {}
        for key, value in properties.items():
            attrs[key] = value

        if node.get("id") and "id" not in attrs:
            attrs["id"] = node["id"]

        if node.get("linkUrl") and "href" not in attrs:
            attrs["href"] = node["linkUrl"]

        if component_name == "Raw:Img":
            image = (node.get("component") or {}).get("options", {}).get("image")
            if image and "src" not in attrs:
                attrs["src"] = image

        return attrs

    def render_node(self, node: Dict[str, Any]) -> str:
        if not isinstance(node, dict):
            return ""

        component = node.get("component") or {}
        component_name = component.get("name", "")

        tag_name = (node.get("tagName") or "").strip()
        if component_name == "Raw:Img" and not tag_name:
            tag_name = "img"
        if not tag_name:
            tag_name = "div"
        tag_name = tag_name.lower()

        if tag_name == "title":
            attrs = self.build_base_attrs(node, component_name)
            self.apply_responsive_styles(node, attrs)
            attr_string = render_attrs(attrs)
            title_text = collect_title_text(node)
            return f"<title{attr_string}>{html.escape(title_text)}</title>"

        attrs = self.build_base_attrs(node, component_name)
        self.apply_responsive_styles(node, attrs)

        attr_string = render_attrs(attrs)

        if tag_name in VOID_TAGS:
            return f"<{tag_name}{attr_string}>"

        child_html_parts: List[str] = []

        if component_name == "Text":
            text_html = component.get("options", {}).get("text", "")
            if text_html:
                child_html_parts.append(text_html)
        elif component_name == "Custom Code":
            code_html = component.get("options", {}).get("code", "")
            if code_html:
                child_html_parts.append(code_html)

        for child in node.get("children") or []:
            if isinstance(child, dict):
                child_html_parts.append(self.render_node(child))

        inner_html = "".join(child_html_parts)
        return f"<{tag_name}{attr_string}>{inner_html}</{tag_name}>"

    def render_media_query_css(self) -> str:
        chunks: List[str] = []
        for bp, query in BREAKPOINT_QUERIES.items():
            rules = self.media_rules.get(bp) or []
            if not rules:
                continue
            chunks.append(f"@media {query}{{{''.join(rules)}}}")
        return "\n".join(chunks)

    def render_document(self, root: Dict[str, Any]) -> str:
        root_component_name = ((root.get("component") or {}).get("name", ""))
        html_attrs = self.build_base_attrs(root, root_component_name)
        self.apply_responsive_styles(root, html_attrs)

        live_html_class = self.live_metadata.get("html_class", "")
        if live_html_class:
            html_attrs["class"] = f"{html_attrs.get('class', '')} {live_html_class}".strip()

        children = [child for child in (root.get("children") or []) if isinstance(child, dict)]
        head_nodes = [child for child in children if (child.get("tagName") or "").lower() == "head"]
        body_nodes = [child for child in children if (child.get("tagName") or "").lower() != "head"]
        head_attrs: Dict[str, str] = {}

        if head_nodes:
            primary_head = head_nodes[0]
            primary_head_component = ((primary_head.get("component") or {}).get("name", ""))
            head_attrs = self.build_base_attrs(primary_head, primary_head_component)
            self.apply_responsive_styles(primary_head, head_attrs)

        head_parts: List[str] = [
            '<meta charset="utf-8">',
            '<meta name="viewport" content="width=device-width, initial-scale=1">',
        ]

        for head_node in head_nodes:
            for child in head_node.get("children") or []:
                if isinstance(child, dict):
                    head_parts.append(self.render_node(child))

        for stylesheet_url in self.live_metadata.get("stylesheet_urls", []):
            escaped_url = html.escape(stylesheet_url, quote=True)
            head_parts.append(f'<link rel="stylesheet" href="{escaped_url}">')

        body_parts = [self.render_node(node) for node in body_nodes]

        media_css = self.render_media_query_css()
        global_css = "html,body{margin:0;padding:0;box-sizing:border-box;}*,*::before,*::after{box-sizing:inherit;}"
        if media_css:
            global_css = f"{global_css}\n{media_css}"

        head_parts.append(f"<style>{global_css}</style>")

        html_attr_string = render_attrs(html_attrs)
        head_html = "".join(head_parts)
        body_html = "".join(body_parts)
        head_attr_string = render_attrs(head_attrs)
        body_attrs: Dict[str, str] = {}
        live_body_class = self.live_metadata.get("body_class", "")
        if live_body_class:
            body_attrs["class"] = live_body_class
        body_attr_string = render_attrs(body_attrs)
        return (
            "<!doctype html>"
            f"<html{html_attr_string}>"
            f"<head{head_attr_string}>{head_html}</head>"
            f"<body{body_attr_string}>{body_html}</body>"
            "</html>"
        )


def main() -> None:
    if not INPUT_PATH.exists():
        raise FileNotFoundError(f"Input not found: {INPUT_PATH}")

    layout = json.loads(INPUT_PATH.read_text(encoding="utf-8"))
    blocks = (layout.get("data") or {}).get("blocks") or []
    if not blocks:
        raise ValueError("No blocks found at data.blocks")

    root = blocks[0]
    live_metadata = fetch_live_site_metadata()
    renderer = Renderer(live_metadata)
    output_html = renderer.render_document(root)
    OUTPUT_PATH.write_text(output_html, encoding="utf-8")

    print(f"Wrote {OUTPUT_PATH} ({len(output_html):,} bytes)")


if __name__ == "__main__":
    main()
