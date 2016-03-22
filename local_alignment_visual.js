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

//Variables outside of draw() scope to store selected alignment for
//display
var rowAlignment = [];
var colAlignment = []; 


// Calculate alignment matrix and draw it 
function draw(seq_1, seq_2, match, misMatch, gap) {

    // Remove previous visuals
    d3.select("svg").remove();

    // Process input sequences
    var sequence_1 = seq_1.split(" ");
    var sequence_2 = seq_2.split(" "); 

    // Append dash in beginning for first row / column
    sequence_1 = ["-"].concat(sequence_1);
    sequence_2 = ["-"].concat(sequence_2);

    //Number of rows and columns
    var nrow = sequence_1.length;
    var ncol = sequence_2.length;

    //Width and height (dynamic depending on length of each sequence)
    var size = 600;
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
       
    //Get the size of each sequence element 
    var l_1 = sequence_1.map(function(e) {return e.length;}); 
    var l_2 = sequence_2.map(function(e) {return e.length;});
      
    // Adapt left and top margin to fit all sequence elements as row and column
    // names
    var l_1_max = Math.max.apply(null, l_1);
    var l_2_max = Math.max.apply(null, l_2);
    var left_margin = 0.05 * w + (0.01 * w * (l_1_max - 1));
    var top_margin = 0.05 * h + (0.01 * h * (l_2_max - 1));
    
    // Padding between matix cells (as proporiton of total width/height)
    var padding = 0.05;
    var row_padding = padding * h / nrow;
    var col_padding = padding * w / ncol; 
 
    // Number of cells in the matrix and their dimensions
    var ncell = nrow * ncol;
    var cell_width = (w - left_margin) / ncol;
    var cell_height = (h - top_margin) / nrow;
    var colorInactive = "orange";

    var fontSize = 0.3 * cell_width

   
    //==============================================

    // Calculate the matrix. Imported from local_alignment.js
    var res = popMat(sequence_1, sequence_2, match, misMatch,
            gap);
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
    var svg = d3.select("body")
                .append("svg")
                .attr("width", w)
                .attr("height", h);

    //Draw trace lines
    svg.selectAll("g")
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
    svg.selectAll("g")
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
        .style("font-size", fontSize)
        .attr("font-family", "Arial")
        .style("fill", "grey");

          

    
    //Draw rectangles
    svg.selectAll("g")
       .append("rect") 
       .attr("x", function(d, i) {return get_coord(i, "x");})
       .attr("y", function(d, i) {return get_coord(i, "y");})
       .attr("width", (cell_width - col_padding))
       .attr("height", (cell_height - row_padding))
       .style("fill", colorInactive)
       .style("stroke", "white")
       .attr("active", false)
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

          d3.select("#rowAlignment").remove();
          d3.select("#colAlignment").remove();
          d = d3.select(this.parentNode).datum()
          if(d['active'] == false){
              d3.select(this).style("opacity", 0.8);
              d['active'] = true;
              d3.select(this.parentNode).__data__ = d;
              rowElement = Math.floor((d['counter'] / ncol));
              colElement = d['counter'] % ncol;
              if(rowElement == colElement) {
                  rowAlignment.push(sequence_1[rowElement]);
                  colAlignment.push(sequence_2[colElement]);
              }
          } else {
              d3.select(this).style("opacity", 0.5);
              d['active'] = false;
              d3.select(this.parentNode).__data__ = d;
          }
            //// Display the alignment
            //Row alignment
            d3.select("body")
              .append("p")
              .attr("id", "rowAlignment")
              .text(rowAlignment.join(" "));
            //Column alignment
            d3.select("body")
              .append("p")
              .attr("id", "colAlignment")
              .text(colAlignment.join(" "));

          
       });




    // Draw the column and row names
    var row_names = svg.selectAll("text.row")
                       .data(sequence_1)
                       .enter()
                       .append("g")
                       .append("text");
     
    row_names.text(function(d) {return d;})
             .attr("y", function(d, i) { 
                 var out = top_margin + i * cell_height +
                     row_padding + 0.5 * cell_height;
                 return out; 
             })
             .attr("x", 0)
             .style("text-anchor", "right");

    var col_names = svg.selectAll("text.col")
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
             .style("text-anchor", "left")
             .style("writing-mode", "vertical-rl");

}

