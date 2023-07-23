var distances = [];
var cities = [];
var minimalPath = [];
var values = [];

function generateTable() {
  var cityCount = parseInt(document.getElementById('cityCount').value);
  var table = document.getElementById('myTable');

  table.innerHTML = '';
  cities = [];

  for (var i = 0; i < cityCount; i++) {
    cities.push(String.fromCharCode(65 + i)); // Génère les lettres A, B, C, ...
  }

  var header = table.createTHead();
  var headerRow = header.insertRow(0);

  // Ajout des en-têtes de colonnes sur la première ligne
  var headerCell = headerRow.insertCell(0);
  headerCell.innerHTML = ''; // Cellule vide en haut à gauche

  for (var i = 0; i < cityCount; i++) {
    var cell = headerRow.insertCell(i + 1);
    cell.innerHTML = cities[i];
  }

  for (var i = 0; i < cityCount; i++) {
    var row = table.insertRow(i + 1);

    // Ajout des en-têtes de lignes sur la première colonne
    var rowHeader = row.insertCell(0);
    rowHeader.innerHTML = cities[i];

    for (var j = 0; j < cityCount; j++) {
      var cell = row.insertCell(j + 1);
      var input = document.createElement('input');
      input.type = 'number';
      input.className = 'normal-cell';

      if (i === j) {
        cell.style.backgroundColor = '#ccc'; // Met en gris les zones non ajoutables
        input.disabled = true; // Désactive les zones non ajoutables
      }

      cell.appendChild(input);
    }
  }
}

function calculateMinimalPath() {
  var table = document.getElementById('myTable');
  var rows = table.getElementsByTagName('tr');
  distances = [];

  for (var i = 1; i < rows.length; i++) {
    var cells = rows[i].getElementsByTagName('td');
    var rowDistances = [];

    for (var j = 1; j < cells.length; j++) {
      var input = cells[j].getElementsByTagName('input')[0];
      var value = parseInt(input.value);
      rowDistances.push(Number.isNaN(value) ? Infinity : value);
    }

    distances.push(rowDistances);
  }

  var b = subtractMinimum(distances); // Soustraction du minimum de chaque ligne
  var r = calculateRegret(distances); // Calcul du maximum des regrets minimaux
  var b1 = b + r;

  var b2 = b;
  var zeroRows = [];
  var zeroCols = [];

  while (true) {
    zeroRows = findZeroRows(distances); // Recherche des zéros par ligne
    zeroCols = findZeroCols(distances); // Recherche des zéros par colonne

    if (zeroRows.length === distances.length && zeroCols.length === distances[0].length) {
      break; // Tous les zéros requis sont présents, on a trouvé le chemin minimal
    }

    if (zeroRows.length !== distances.length) {
      b2 += subtractMinimumWithBlockedArc(distances, zeroRows, []); // Soustraction du minimum avec arc bloqué (Type 1)
    } else if (zeroCols.length !== distances[0].length) {
      b2 += subtractMinimumWithBlockedArc(distances, [], zeroCols); // Soustraction du minimum avec arc bloqué (Type 2)
    } else {
      break; // Aucun zéro requis n'est présent, arrêt de l'algorithme
    }
  }

  var minimalCost = Math.min(b1, b2); // Coût minimal

  minimalPath = [];
  var path = [];
  
  for (var i = 1; i < cities.length; i++) {
    path.push(i);
  }
  
  calculateMinimalPathRecursive(path, 0, 0, [0]);

  var pathOutput = document.getElementById('pathOutput');
  pathOutput.innerHTML = '<h3>Chemin minimal :</h3>';
  
  
  displayPath();
  drawGraph();
}

function calculateMinimalPathRecursive(path, currentCity, currentDistance, currentPath) {
  if (path.length === 0) {
    minimalPath = currentPath.slice();
    return currentDistance + distances[currentCity][0];
  }

  var minDistance = Infinity;
  var minPath = [];

  for (var i = 0; i < path.length; i++) {
    var nextCity = path[i];
    var newPath = path.slice(0, i).concat(path.slice(i + 1));
    var newDistance = currentDistance + distances[currentCity][nextCity];
    var newPathSoFar = currentPath.concat(nextCity);

    var distance = calculateMinimalPathRecursive(newPath, nextCity, newDistance, newPathSoFar);

    if (distance < minDistance) {
      minDistance = distance;
      minPath = minimalPath.slice();
    }
  }

  minimalPath = minPath.slice();

  return minDistance;
}
function displayPath() {
   var table = document.getElementById('myTable');
   var rows = table.getElementsByTagName('tr');

   values = []; // Réinitialise le tableau des valeurs
 // Réinitialise les couleurs de toutes les cellules du tableau
 
  for (var i = 0; i < minimalPath.length - 1; i++) {
    var start = minimalPath[i];
    var end = minimalPath[i + 1];
    var row = rows[start + 1];
    var cell = row.cells[end + 1];
    var input = cell.getElementsByTagName('input')[0];
    var value = input.value; // Récupère la valeur du champ input
    values.push(value); // Ajoute la valeur au tableau
    input.classList.add('highlight-cell'); // Ajoute la classe "highlight-cell" pour mettre en évidence les cellules du chemin optimal
  }

  // Ajout du dernier chemin de retour au point de départ
  var lastStart = minimalPath[minimalPath.length - 1];
  var lastEnd = minimalPath[0];

  var lastRow = rows[lastStart + 1];
  var lastCell = lastRow.cells[lastEnd + 1];
  var lastInput = lastCell.getElementsByTagName('input')[0];
  var lastValue = lastInput.value;
  values.push(lastValue);
  lastInput.style.backgroundColor = 'transparent';

  var totalDistance = values.reduce(function(acc, curr) {
    return acc + parseInt(curr);
  }, 0);

  var pathOutput = document.getElementById('pathOutput');
  pathOutput.innerHTML = '<h3>Chemin minimal :</h3>';
  pathOutput.innerHTML += '<p>Distance totale : ' + totalDistance + '</p>';
  pathOutput.innerHTML += cities[minimalPath[0]];

  for (var i = 1; i < minimalPath.length; i++) {
    var distance = values[i - 1]; // Récupère la distance entre les chemins à partir du tableau values
    pathOutput.innerHTML += ' -> ' + cities[minimalPath[i]] + ' (' + distance + ') ';
  }
  pathOutput.innerHTML += ' -> ' + cities[0];

  var highlightedValues = document.getElementById('highlightedValues');
  highlightedValues.innerHTML = '<h3>Valeurs en surbrillance :</h3>';

  for (var i = 0; i < minimalPath.length - 1; i++) {
    var start = minimalPath[i];
    var end = minimalPath[i + 1];
    var distance = distances[start][end];

    highlightedValues.innerHTML += cities[start] + ' -> ' + cities[end] + ' : ' + values[i] + '<br>'; // Affiche les valeurs du tableau values correspondant aux distances entre les chemins
  }

  // Ajout de la dernière valeur de chemin de retour au point de départ
  var lastStart = minimalPath[minimalPath.length - 1];
  var lastEnd = minimalPath[0];
  var lastDistance = distances[lastStart][lastEnd];

  highlightedValues.innerHTML += cities[lastStart] + ' -> ' + cities[lastEnd] + ' : ' + values[values.length - 1] + '<br>';

  var totalDistance = values.reduce(function(acc, curr) {
    return acc + parseInt(curr);
  }, 0);

  var pathOutput = document.getElementById('pathOutput');
  pathOutput.innerHTML = '<h3>Chemin minimal :</h3>';
  pathOutput.innerHTML += '<p>Distance totale : ' + totalDistance + '</p>';
  pathOutput.innerHTML += cities[minimalPath[0]];

  for (var i = 1; i < minimalPath.length; i++) {
    var distance = values[i - 1];
    pathOutput.innerHTML += ' -> ' + cities[minimalPath[i]] + ' (' + distance + ') ';
  }
  pathOutput.innerHTML += ' -> ' + cities[0];

  var highlightedValues = document.getElementById('highlightedValues');
  highlightedValues.innerHTML = '<h3>Distances :</h3>';

  for (var i = 0; i < minimalPath.length; i++) { // Modifier cette ligne
    var start = minimalPath[i];
    var end = minimalPath[(i + 1) % minimalPath.length]; // Ajouter cette ligne pour le dernier élément du chemin
    var distance = distances[start][end];

    highlightedValues.innerHTML += cities[start] + ' -> ' + cities[end] + ' : ' + values[i] + '<br>';
  }
}


function calculatePathLength(path) {
  var length = 0;

  for (var i = 0; i < path.length - 1; i++) {
    var start = path[i];
    var end = path[i + 1];
    length += distances[start][end];
  }

  length += distances[path[path.length - 1]][path[0]]; // Ajouter la distance du retour au point de départ

  return length;
}

function drawGraph() {
  var graphContainer = document.getElementById('graph');
  graphContainer.innerHTML = '';

  var width = 1000;
  var height = 600;

  var svg = d3.select("#graph")
              .append("svg")
              .attr("width", width)
              .attr("height", height);

  var radius = width * 0.2;
  var angle = (2 * Math.PI) / cities.length;

  var points = [];

  for (var i = 0; i < cities.length; i++) {
    var x = width / 2 + Math.cos(i * angle) * radius;
    var y = height / 2 + Math.sin(i * angle) * radius;
    points.push({ x: x, y: y });
  }

  // Dessin des cercles des villes
  svg.selectAll(".city-circle")
    .data(points)
    .enter()
    .append("circle")
    .attr("class", "city-circle")
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .attr("r", 25)
    .style("fill", "whitesmoke");

  var curve = d3.line().curve(d3.curveBasis);

  // Dessin des flèches et des valeurs de chemin
  for (var i = 0; i < minimalPath.length - 1; i++) {
    var start = minimalPath[i];
    var end = minimalPath[i + 1];
    var startPoint = points[start];
    var endPoint = points[end];

    var value = values[i]; // Récupère la valeur correspondante à partir du tableau values

    var dx = endPoint.x - startPoint.x;
    var dy = endPoint.y - startPoint.y;
    var dr = Math.sqrt(dx * dx + dy * dy);

    // Dessin de la flèche courbée avec pointe
    var path = svg.append("path")
      .attr("d", curve([
        [startPoint.x, startPoint.y],
        [(startPoint.x + endPoint.x) / 2, (startPoint.y + endPoint.y) / 2 - dr / 2],
        [endPoint.x, endPoint.y]
      ]))
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("marker-end", "url(#arrowhead)");

    // Ajout du texte avec la valeur de la distance
    svg.append("text")
      .attr("x", (startPoint.x + endPoint.x) / 2)
      .attr("y", (startPoint.y + endPoint.y) / 2 - dr / 2 - 10)
      .text(value)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("class", "path-label");
  }

  // Dessin du retour au point de départ
  var startCity = minimalPath[0];
  var startPoint = points[startCity];
  var endPoint = points[minimalPath[minimalPath.length - 1]];

  var dx = endPoint.x - startPoint.x;
  var dy = endPoint.y - startPoint.y;
  var dr = Math.sqrt(dx * dx + dy * dy);

  // Dessin de la flèche courbée avec pointe pour le retour au point de départ
  svg.append("path")
    .attr("d", curve([
      [endPoint.x, endPoint.y],
      [(startPoint.x + endPoint.x) / 2, (startPoint.y + endPoint.y) / 2 + dr / 2],
      [startPoint.x, startPoint.y]
    ]))
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("marker-end", "url(#arrowhead)");

  // Ajout des étiquettes des villes
  svg.selectAll(".city-label")
    .data(cities)
    .enter()
    .append("text")
    .attr("x", function(d, i) { return points[i].x; })
    .attr("y", function(d, i) { return points[i].y - 12; })
    .text(function(d) { return d; })
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("class", "city-label");

  // Définition du marqueur pour la pointe de la flèche
  svg.append("defs")
    .append("marker")
    .attr("id", "arrowhead")
    .attr("markerWidth", "10")
    .attr("markerHeight", "10")
    .attr("refX", "8")
    .attr("refY", "3")
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,0 L0,6 L9,3 z")
    .attr("fill", "black");
}

// Fonction pour soustraire le minimum de chaque ligne
function subtractMinimum(distances) {
  var b = 0;

  for (var i = 0; i < distances.length; i++) {
    var min = Math.min(...distances[i]);

    if (min !== Infinity) {
      for (var j = 0; j < distances[i].length; j++) {
        if (distances[i][j] !== Infinity) {
          distances[i][j] -= min;
        }
      }

      b += min;
    }
  }

  return b;
}

// Fonction pour calculer le regret minimal
function calculateRegret(distances) {
  var maxRegret = 0;

  for (var i = 0; i < distances.length; i++) {
    var min1 = Infinity;
    var min2 = Infinity;

    for (var j = 0; j < distances[i].length; j++) {
      if (distances[i][j] !== Infinity) {
        if (distances[i][j] < min1) {
          min2 = min1;
          min1 = distances[i][j];
        } else if (distances[i][j] < min2) {
          min2 = distances[i][j];
        }
      }
    }

    var regret = min2 - min1;

    if (regret > maxRegret) {
      maxRegret = regret;
    }
  }

  return maxRegret;
}

// Fonction pour soustraire le minimum avec arc bloqué (Type 1 ou Type 2)
function subtractMinimumWithBlockedArc(distances, blockedRows, blockedCols) {
  var b = 0;

  for (var i = 0; i < distances.length; i++) {
    if (!blockedRows.includes(i)) {
      var min = Math.min(...distances[i].filter((value, index) => !blockedCols.includes(index)));

      if (min !== Infinity) {
        for (var j = 0; j < distances[i].length; j++) {
          if (!blockedCols.includes(j) && distances[i][j] !== Infinity) {
            distances[i][j] -= min;
          }
        }

        b += min;
      }
    }
  }

  return b;
}

// Fonction pour trouver les zéros par ligne
function findZeroRows(distances) {
  var zeroRows = [];

  for (var i = 0; i < distances.length; i++) {
    if (distances[i].includes(0)) {
      zeroRows.push(i);
    }   
  }

  return zeroRows;
}

// Fonction pour trouver les zéros par colonne
function findZeroCols(distances) {
  var zeroCols = [];

  for (var i = 0; i < distances[0].length; i++) {
    var col = distances.map(row => row[i]);

    if (col.includes(0)) {
      zeroCols.push(i);
    }
  }

  return zeroCols;
}
