---
layout: default
title: "Portfolio"
permalink: /portfolio/
---

# Portfolio

<div class="grid">
{% for project in site.data.projects %}
  <div class="card">
    <img src="{{ project.image | relative_url }}" alt="{{ project.title }}">
    <div class="card-content">
      <h3>{{ project.title }}</h3>
      <p>{{ project.description }}</p>
      {% if project.link %}
        <a href="{{ project.link }}" class="card-btn">Learn more →</a>
      {% endif %}
    </div>
  </div>
{% endfor %}
</div>
