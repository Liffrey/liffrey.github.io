async function buildIndex(){
  const resp = await fetch('{{ "/search.json" | relative_url }}');
  const pages = await resp.json();
  const idx = lunr(function(){
    this.ref('url');
    this.field('title');
    this.field('content');
    pages.forEach(p=>this.add(p));
  });
  return {idx,pages};
}
(async ()=>{
  const {idx,pages}=await buildIndex();
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';
  document.getElementById('search-box').value=q;
  const results = q? idx.search(q) : [];
  const list = document.getElementById('results');
  if(!results.length){ list.innerHTML='<p>No results.</p>'; }
  else{
    list.innerHTML='';
    results.forEach(r=>{
      const page = pages.find(p=>p.url===r.ref);
      const li=document.createElement('li');
      li.innerHTML=`<a href="${page.url}">${page.title}</a>`;
      list.appendChild(li);
    });
  }
})();
