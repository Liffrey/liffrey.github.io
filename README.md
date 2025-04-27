
# Links
- Original 
  - https://academicpages.github.io/

# Installation Steps (not on GitHub Pages, to serve on your own computer)
- Clone the repository and made updates as detailed above
- Make sure you have ruby-dev, bundler, and nodejs installed: `sudo apt install ruby-dev ruby-bundler nodejs`
- Run `bundle clean` to clean up the directory (no need to run `--force`)
- Run `bundle install` to install ruby dependencies. If you get errors, delete Gemfile.lock and try again.
  - Her şey doğrumu diye "jekyll -v" ile versiyon kontorlü yapılır.

# to RUN Locally
- root dizininden docs dizinine gidilir.                                `cd docs`  
- Localde servis komutu çalıştırılır.                                   `bundle exec jekyll serve`  
- Komut penceresinde server address kısmında yazan yere gidilir. örnek  `http://127.0.0.1:4000/`