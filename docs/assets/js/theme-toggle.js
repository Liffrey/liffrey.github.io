const toggleSwitch = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';

document.documentElement.setAttribute('data-theme', currentTheme);
toggleSwitch.checked = currentTheme === 'dark';

toggleSwitch.addEventListener('change', () => {
  const theme = toggleSwitch.checked ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
});
