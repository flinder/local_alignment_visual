## Local Alignment Visualization 


### About

A D3 visualization of the Smith-Waterman local alignment algorithm. Calculates
optimal local alignment given specified parameters. The visualization is
relatively adaptive to different input sequences. Works with classic sequences
containing of one-letter-elements or text sequences with longer words.

![The visual. Sequences and parameters can be specified via an html form. After
submission, a matrix is generated and populated with alignment scores.
the trace is indicated by lines pointing in the relevant direction. The matrix
is interactive. When selecting a field in the matrix, the trace leading to the
optimal alignment ending in this field is highlighted and the resulting
alignment is displayed on the right side of the matrix. See the [blog
post]()(not up yet)
for more details on the algorithm.](example.png)

### How to use it

You can try it out on my [website](http://fridolin-linder.com/2016/03/30/local-alignment.html). 

### License

MIT License

Copyright (c) 2016 Fridolin Linder

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
