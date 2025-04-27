---
layout: default
title: Blog
permalink: /blog/
---

# Blog

{% if site.posts == empty %}
_No blog posts yet – create one in the **_posts/** folder!_
{% else %}
{% for post in site.posts %}
<article>
  <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
  <p class="post-meta">{{ post.date | date: "%B %d, %Y" }}</p>
  <p>{{ post.excerpt | strip_html }}</p>
</article>
<hr>
{% endfor %}
{% endif %}
