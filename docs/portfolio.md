---
layout: default
title: Portfolio
permalink: /portfolio/
---

# Portfolio

{% for project in site.projects %}
<article>
  <h2><a href="{{ project.url | relative_url }}">{{ project.title }}</a></h2>
  <p class="post-meta">{{ project.date | date: "%Y" }}</p>
  <p>{{ project.excerpt }}</p>
</article>
<hr>
{% endfor %}
