// Score two sequence elements
score = function(x, y, match, misMatch) {
   if(x == y) {
       return match;
   } else {
       return misMatch;
   } 
}

// Create empty matrix
makeMatrix = function(rows, cols) {
    var arr = [], row = [];
    while (cols--) row.push(0);
    while (rows--) arr.push(row.slice());
    return arr;
}

// Populate Matrix
var popMat = function(s_1, s_2, match, misMatch, gap) {
    
    //Populate the dynamic programming array according to the Smith-Waterman
    //algorithm. The matrix are stored as arrays of arrays where the second
    //level of arrays are the rows of the matrix

    var l1 = s_1.length;
    var l2 = s_2.length;
    var score_mat = makeMatrix(l1, l2);
    var trace_mat = makeMatrix(l1, l2);

    for(i = 0; i < l1; ++i) {

        for(j = 0; j < l2; ++j) {

            // This is the first row / column which is all zeros
            if(i == 0 || j == 0) {
                score_mat[i][j] = 0;
                trace_mat[i][j] = 3;
                continue;

            } else {
                var d_last = score_mat[i-1][j-1];
                var u_last = score_mat[i-1][j];
                var l_last = score_mat[i][j-1];
            }
            var d_new = d_last + score(s_1[i], s_2[j],
                    match, misMatch); 
            var u_new = u_last + gap;
            var l_new = l_last + gap;
            score_mat[i][j] = Math.max(d_new, u_new, l_new, 0);
            var arr = [d_new, u_new, l_new, 0];
            var trace = arr.indexOf(Math.max.apply(Math, arr));
            trace_mat[i][j] = trace; 
        }
    }
    return [score_mat, trace_mat]; 
}

// Backtrace from selected field
var backtrace = function(index, score_matrix, trace_matrix) {

}

// Get the optimum alignment
var getOptimum = function(score_matrix, trace_matrix) {

    //Find maximum score
        
}
