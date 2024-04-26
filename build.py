import glob
import secrets
import sys


# From https://github.com/django/django/blob/8dbfef469582128c9d8487bf3f45d861b2ecfcb9/django/utils/crypto.py#L51
def get_random_string(length):
    RANDOM_STRING_CHARS = (
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    )

    """
    Return a securely generated random string.

    The bit length of the returned value can be calculated with the formula:
        log_2(len(allowed_chars)^length)

    For example, with default `allowed_chars` (26+26+10), this gives:
      * length: 12, bit length =~ 71 bits
      * length: 22, bit length =~ 131 bits
    """
    return "".join(secrets.choice(RANDOM_STRING_CHARS) for i in range(length))


def build(minify=False):
    head_html = open("html/fragments/header.html", "r").read()
    footer_html = open("html/fragments/footer.html", "r").read()

    cache_buster = get_random_string(8)
    for f in [
        "functions.js",
        "styles.css",
        "slide-show.css",
        "slide-show.js",
        "overflow-toggle.css",
        "overflow-toggle.js",
    ]:
        cf = f
        if minify:
            cf = f.replace(".css", ".min.css").replace(".js", ".min.js")
        head_html = head_html.replace(f, f"{cf}?v={cache_buster}")

    for f in glob.glob("html/*.html"):
        print(f"Processing {f}")
        with open(f, "r") as source:
            html = source.read()
            html = html.replace("<!--headhtml-->", head_html).replace(
                "</body>", footer_html
            )

            with open(f.replace("html/", "public/"), "w") as dest:
                dest.write(html)


if __name__ == "__main__":
    build(minify="--minify" in sys.argv)
