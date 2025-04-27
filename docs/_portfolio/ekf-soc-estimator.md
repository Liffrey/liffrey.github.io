---
title: "EKF-GA SoC Estimator"
layout: project
summary: "GA-tuned Kalman filter beats 2 % MSE on Panasonic PF cells"
date: 2025-04-28
cover: /assets/img/ekf-demo.png          # optional
github: https://github.com/liffrey/ekf-soc-estimator
demo:   https://soc-estimator.vercel.app
---

### What it does  
* Tunes **Q, R, P** matrices via a Genetic Algorithm  
* Achieves < 2 % mean-squared error against coulomb-count ground truth

### Highlights  
1. Parallel fitness evaluation → speeds GA 8×  
2. Drop-in wrapper for PyKalman
