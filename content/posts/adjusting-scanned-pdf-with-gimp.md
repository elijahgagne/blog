---
title: "Adjusting Scanned PDF With GIMP"
date: 2021-03-25
tags: ["software"]
draft: false
---

This is not what I expected my second blog post to be. However, in the last month, I've had to Google how I can use [GIMP](https://www.gimp.org/) to "lighten white and darken blacks" several times. For those unaware, GIMP is a free and open source image editor. Think PhotoShop, but free. My issue is that I've needed to print, sign, and scan mutliple documents recently and the handwriting is routinely showing up faint. I could either use a Sharpie to sign the document or use software to adjust the contrast. I chose the latter.

The blog post I have to keep finding is [How to Brighten Whites & Darken Blacks in GIMP (6 Steps)
](https://itstillworks.com/brighten-whites-darken-blacks-gimp-29144.html), which is great, but it's steps are slightly off for the newer versions of GIMP. So, why not create a blog post to make this easier on myself the next time I need to do it?

Let's begin by opening GIMP. In my case, I'm using version 2.10 on macOS Big Sur. `File`, `Open`, navigate to the PDF, `Open`, `Import`. Note `+` and `-` are the shortcuts to Zoom in GIMP.

Next, navigate to `Colors`, `Levels...`

![color-levels.png](/adjusting-scanned-pdf-with-gimp/color-levels.png)

Under `Input Levels` change the lower bound from `0` to something like `120`. Change the upper bound from `255` to something like `220`.

![change-levels.png](/adjusting-scanned-pdf-with-gimp/change-levels.png)

Once satified, click `OK`. Then Save or Export the file.
