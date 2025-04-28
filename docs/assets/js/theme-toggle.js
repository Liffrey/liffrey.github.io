const btn = document.getElementById('theme-toggle');
const stored = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', stored);

btn.addEventListener('click', () => {
  let next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});
