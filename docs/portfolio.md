---
layout: default
title: "Portfolio"
permalink: /portfolio/
---

# Portfolio

{% for project in site.data.projects %}
## {{ project.title }}

![{{ project.title }}]({{ project.image | relative_url }})

{{ project.description }}

[Learn more →]({{ project.link }})

---

{% endfor %}
