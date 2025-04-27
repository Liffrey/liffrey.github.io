(function(){
  const storageKey='theme-preference';
  const getPreference = () => localStorage.getItem(storageKey) || 'auto';
  const setPreference = (pref) => { document.documentElement.setAttribute('data-theme',pref); localStorage.setItem(storageKey,pref); };
  setPreference(getPreference());
  document.getElementById('theme-toggle').addEventListener('click',()=>{
    const current=getPreference();
    const next=(current==='light')?'dark':(current==='dark')?'light':'dark';
    setPreference(next);
  });
  if(getPreference()==='auto'){
    const mediaQuery=window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change',()=>{if(getPreference()==='auto') setPreference('auto');});
  }
})();
