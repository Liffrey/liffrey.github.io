---
title: "Portfolio"
layout: page
permalink: /portfolio/
---

## Selected Work

<div class="grid">
{% assign items = site.portfolio | sort:'date' | reverse %}
{% for p in items %}
  <article class="card">
    {% if p.cover %}<img src="{{ p.cover | relative_url }}" alt="">{% endif %}
    <h3><a href="{{ p.url | relative_url }}">{{ p.title }}</a></h3>
    <p>{{ p.summary }}</p>
  </article>
{% endfor %}
</div>
