---
title:  "EKF-GA SoC Estimator"
layout: project
summary: "GA ile optimize edilmiş EKF; %1.8 MSE"
date:   2025-04-28
cover:  /assets/img/ekf-cover.png      # dosyayı eklerseniz
github: https://github.com/liffrey/ekf-soc-estimator
demo:   https://soc-estimator.vercel.app
---

## Proje Özeti
Lityum-iyon bataryalar için EKF parametrelerini GA ile ayarlayarak SoC tahmin hatasını düşüren Python kütüphanesi.

### Öne Çıkanlar
- Q, R, P kovaryans matrislerini GA ile otomatik ayar
- LSTM modeliyle kıyaslama
