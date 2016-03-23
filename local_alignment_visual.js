//Function to handle the form submission and 
//redraw the matrix 
function handleFormSubmission(event){
    //console.log(document.getElementById("seq_q").value)
    //draw(document.getElementById("myVal").value)
    var seq_1 = document.getElementById("seq_1").value;
    var seq_2 = document.getElementById("seq_2").value;
    var match =
        parseFloat(document.getElementById("match").value);
    var misMatch =
        parseFloat(document.getElementById("misMatch").value);
    var gap =
        parseFloat(document.getElementById("gap").value);

    draw(seq_1, seq_2, match, misMatch, gap); 
    return false;
}


// Calculate alignment matrix and draw it 
function draw(seq_1, seq_2, match, misMatch, gap) {

    // Remove previous visuals
    d3.selectAll("svg").remove();

    // Process input sequences
    var sequence_1 = seq_1.split(" ");
    var sequence_2 = seq_2.split(" "); 

    // Append dash in beginning for first row / column
    sequence_1 = ["-"].concat(sequence_1);
    sequence_2 = ["-"].concat(sequence_2);

    //Number of rows and columns
    var nrow = sequence_1.length;
    var ncol = sequence_2.length;

    // Determine font size. If  
    var fontSize = 12;
    
    // Measure text width
    var allText = sequence_1.concat(sequence_2);
    var testSvg = d3.select("body").append("svg").attr("id", "textTest")

    var text = testSvg.selectAll("g")
                 .data(allText)
                 .enter()
                 .append("g")
                 .attr("id", "test")
                 .append("text")
                 .text(function(d) { return d;})
                 .attr("font-size", fontSize)
                 .style("font-family", font);

    var maxWidth = 0;
    var maxHeight = 0;
    text.each(function() {
        var width = this.getBBox().width;
        var height = this.getBBox().height;
        if(width > maxWidth) {
            maxWidth = width;
        }
        if(height > maxHeight) {
            maxHeight = height;
        }
    });

    d3.select("#textTest").remove()
    
    var maxFontSize = 12;
    //Width and height of the matrix (dynamic depending on length of each sequence)

    var bw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
    var bh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

    var size = 0.95 * Math.min(bw, bh);
    if(nrow == ncol) { 
        var w = size;
        var h = size;
    } else if(nrow > ncol) {
        var h = size;
        var w = size * ncol / nrow;
    } else if(nrow < ncol) { //>
        var w = size;
        var h = size * nrow / ncol;
    }
      
    var left_margin = 1.1 * maxWidth;
    var top_margin = 1.1 * maxWidth;
    
    // Padding between matix cells (as proporiton of total width/height)
    var padding = 0.05;
    var row_padding = padding * h / nrow;
    var col_padding = padding * w / ncol; 
 
    // Number of cells in the matrix and their dimensions
    var ncell = nrow * ncol;
    var cell_width = (w - left_margin) / ncol;
    var cell_height = (h - top_margin) / nrow;
    var colorInactive = "orange";

    // Size of different fonts
        var font = "Arial";
    var maxSize = 0;

    
    //==============================================

    // Calculate the matrix. Imported from local_alignment.js
    var res = popMat(sequence_1, sequence_2, match, misMatch, gap);
    var score_mat = res[0];
    var trace_mat = res[1];
     

    var data = new Array();
    var c = 0;
    var max_score = 0;
    for(i = 0; i < nrow; i++) { //>
        for(j = 0; j < ncol; j++) { //>

            //get max score for color gradient scaling
            if(score_mat[i][j] > max_score) {
                max_score = score_mat[i][j];
            }
            
            // Store all relevant data in json object array in order to append
            // to DOMS in d3
            var doc = {"score": score_mat[i][j],
                       "trace": trace_mat[i][j],
                       "active": false,
                       "counter": c}
            data.push(doc)
            c = c + 1;
        }
    }
    
   var get_coord = function(i, coord) {
        // Function to get the x and y positions from the cell index (running number
        // of cells, cells are counted row-wise 
        col = i % ncol;
        row = Math.floor((i / ncol));  
        if(coord == "x") {
            returnValue = col * cell_width + col_padding + 
                left_margin;
        } else if(coord == "y") { 
            returnValue = row * cell_height + row_padding +
                top_margin; }

        return returnValue;
    } 


    //Create SVG matrix element                           
    var scoreMatrix = d3.select("body").append("svg")
                                       .attr("width", w)
                                       .attr("height", h); 

    var alignSvg = d3.select("body").append("svg")
                                     .attr("width", 0.5 * w)
                                     .attr("height", h)
                                     .attr("id", "align_svg")
    //Draw trace lines
    scoreMatrix.selectAll("g")
               .data(data)
               .enter()
               .append("g")
               .append("line")
               .attr("x1", function(d, i){ 
                   if(d['trace'] == 1) {
                       return get_coord(i, "x") + 0.4 * cell_width;
                   } else {
                       return get_coord(i, "x");
                   }
               })
               .attr("y1", function(d, i){ 
                   if(d['trace'] == 2) {
                       return get_coord(i, "y") + 0.4 * cell_width;
                   } else {
                       return get_coord(i, "y");
                   }
               })
               .attr("x2", function(d, i){ 
                   var out = get_coord(i, "x") + 0.4 * cell_width; 
                   return out;
               })
               .attr("y2", function(d, i){
                   out = get_coord(i, "y") + 0.4 * cell_height;
                   return out;
               })
               .attr("stroke-width", 1)
               .attr("stroke", function(d, i){
                   //Don't draw a trace line if the score is zero or the choice was zero
                   if(d['trace'] == 3 || d['score'] == 0) {
                       return "none"; 
                   } else {
                       return "grey";
                   }
                    
               });


    //Draw the scores
    scoreMatrix.selectAll("g")
               .append("text")
               .text(function(d, i) {return d["score"];})
               .attr("x", function(d, i) {
                   var out = get_coord(i, "x") + 0.5 * 
                       cell_width - 0.1 * fontSize;
                   return out;
               })
               .attr("y", function(d, i) {
                   var out = get_coord(i, "y") + 0.5 *
                       cell_height + 0.2 * fontSize;
                   return out;
               })
               .style("text-anchor", "middle")
               .style("font-size", 0.3 * cell_width)
               .attr("font-family", "Arial")
               .style("fill", "grey");

    
    var visualizeTrace = function(index, counter) {
        id_ = '#cell_' + index;
        scoreMatrix.select(id_)
                   .transition()
                   .delay(counter * 100)
                   .duration(2000)
                   .style("fill", "lightblue");
    }

    var visualizeElem = function(counter) {
        id_ = '#align_element_' + counter;
        d3.selectAll(id_).selectAll("text")
           .transition()
           .delay(counter * 100)
           .duration(2000)
           .style("opacity", 1);
    }

    
    //Draw rectangles
    scoreMatrix.selectAll("g")
       .append("rect") 
       .attr("x", function(d, i) {return get_coord(i, "x");})
       .attr("y", function(d, i) {return get_coord(i, "y");})
       .attr("width", (cell_width - col_padding))
       .attr("height", (cell_height - row_padding))
       .style("fill", colorInactive)
       .style("stroke", "white")
       .attr("active", false)
       .attr("id", function(d, i) { return "cell_" + i })
       .style("opacity", function(d) {
           var s = d['score'];
           return (((s / max_score) + 0.1) * 0.8);
       })                             
       .on('mouseover', function(d) {
           d3.select(this).style("stroke", "grey") 
                          .style("stroke-width", 2)
       })
       .on('mouseout', function(d) {
           d3.select(this).style("stroke", "white")
                          .style("stroke-width", 1)
       })
       .on('click', function(d, i) {
          
            
          // Reset all old values
          scoreMatrix.selectAll("rect")
              .style("fill", colorInactive)
              .style("opacity", function(d) {
                  var s = d['score'];
                  return (((s / max_score) + 0.1) * 0.8);
              })

          // Get row and col number
          var col = i % ncol;
          var row = Math.floor((i / ncol));  

          // Get the trace 
          var trace = [i];
          var col_align = [];
          var row_align = [];

          while (true) {
              
              var step = trace_mat[row][col];

              if (score_mat[row][col] == 0) {
                  break;
              } else if (step == 0) {
                  i = i - (ncol + 1);
                  var row_res = sequence_1[row];
                  var col_res = sequence_2[col];
              } else if(step == 1) {
                  i = i - ncol;
                  var col_res = "-";
                  var row_res = sequence_1[row];
              } else if(step == 2) {
                  i = i - 1;
                  var col_res = sequence_2[col];
                  var row_res = "-"
              } else if(step == 0) {
                  break;
              }
              col = i % ncol;
              row = Math.floor((i / ncol));  
              trace.push(i);
              col_align.push(col_res);
              row_align.push(row_res);
          }
          trace.pop();
          // Reverse it to start at beginning
          trace.reverse()
          col_align.reverse()
          row_align.reverse()
                  
 
         d3.selectAll("#row_element_container").remove()
         d3.selectAll("#col_element_container").remove()
         d3.select("#resultTitle").remove()

         d3.select("#align_svg").append("g")
                  .attr("id", "resultTitle")
                  .append("text")
                  .text("Alignment Result")
                  .attr("x", 5 * col_padding)
                  .attr("y", maxHeight)
                  .attr("fill", "grey")
                  .attr("font-family", "Arial")
                  .attr("font-size", Math.min(0.3 * cell_height, maxFontSize))

         d3.select("#align_svg").append("g")
                  .attr("id", "row_element_container")
                  .selectAll("g.row")
                  .data(row_align)
                  .enter()
                  .append("g")
                  .attr("id", function(d, i) {return "align_element_" + i;})
                  .append("text")
                  .attr("font-size", Math.min(maxFontSize, 0.3 * cell_height))
                  .attr("x", 5 * col_padding)
                  .attr("y", function(d, i) { 
                      return top_margin + 0.5 * cell_height + i * cell_height + row_padding;
                              })
                  .text(function(d, i) { return d })
                  .attr("opacity", 0)
                  .attr("fill", function(d, i) {
                      if(col_align[i] == d | d == '-') {
                          return "grey";
                      } else if(col_align[i] == '-') {
                          return "orange";
                      } else {
                          return "red";
                      }
                  })
                  .attr("font-family", "sans-serif");

         d3.select("#align_svg").append("g")
                  .attr("id", "col_element_container")
                  .selectAll("g.col")
                  .data(col_align)
                  .enter()
                  .append("g")
                  .attr("id", function(d, i) {return "align_element_" + i;})
                  .append("text")
                  .attr("font-size", Math.min(maxFontSize, 0.3 * cell_height))
                  .attr("x", 5 * col_padding + 1.2 * maxWidth)
                  .attr("y", function(d, i) { 
                      return top_margin + 0.5 * cell_height + i * cell_height + row_padding;
                              })
                  .text(function(d, i) { return d })
                  .attr("opacity", 0)
                  .attr("fill", function(d, i) {
                      if(row_align[i] == d | d == '-') {
                          return "grey";
                      } else if(row_align[i] == '-') {
                          return "orange";
                      } else {
                          return "red";
                      }
                  })
                  .attr("font-family", "sans-serif");


          // Transition the cells to new color
          for(j = 0; j < trace.length; ++j) { 
                visualizeTrace(trace[j], j);
                visualizeElem(j);
          }          
 
               
       });

    // Draw the column and row names

    var row_names = scoreMatrix.selectAll("text.row")
                       .data(sequence_1)
                       .enter()
                       .append("g")
                       .append("text");
     
    row_names.text(function(d) {return d;})
             .attr("y", function(d, i) { 
                 var out = top_margin + 0.5 * cell_height + i * cell_height + row_padding;
                 return out; 
             })
             .attr("x", 0)
             .attr("id", function(d, i) { return "row_" + i; })
             .style("text-anchor", "right")
             .style("fill", "grey")
             .attr("font-family", "Arial")
             .style("font-size", Math.min(0.3 * cell_height, maxFontSize));
                 
    var col_names = scoreMatrix.selectAll("text.col")
                       .data(sequence_2)
                       .enter()
                       .append("g") 
                       .append("text");
     
    col_names.text(function(d) {return d;})
             .attr("x", function(d, i) { 
                 var out = left_margin + i * cell_width +
                     col_padding + 0.5 * cell_width;
                 return out; 
             })
             .attr("y", 0)
             .attr("id", function(d, i) { return "col_" + i; })
             .style("text-anchor", "left")
             .style("writing-mode", "vertical-rl")  
             .style("fill", "grey")
             .attr("font-family", "Arial")
             .style("font-size", Math.min(0.3 * cell_height, maxFontSize));

}

