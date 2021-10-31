function getDataPromise() {
  // Create data
  const url = "https://raw.githubusercontent.com/ravichandrasekaran/remembrance/main/remembrance.csv";
  var parseDate = d3.timeParse("%Y-%m-%d");
  const dat = d3.csv(url, function (d) {
    return {
      date_of_death: parseDate(d.date_of_death),
      name: d.name,
      age: +d.age,
      race: d.race,
      gender_identity: d.gender_identity,
      city: d.city,
      state_abbr: d.state_abbr,
      manner_of_death: d.manner_of_death,
      misgendered: (d.misgendered == true)
    }
  });
  return dat;
}

function getDataOriginal() {
  // Create data
  var parseTime = d3.timeParse("%Y-%m-%d");
  var data = [
    {
      name: "Papi Edwards",
      age: 20,
      race: "Black",
      gender_identity: "Transgender woman",
      city: "Louisville",
      state: "KY",
      x: 80,
      date_of_death: parseTime("2019-01-09"),
      manner: "homocide",
      misgendered: true
    },
    {
      name: "Penny Proud", age: 21, race: "Black",
      gender_identity: "Transgender woman", city: "New Orleans",
      x: 80,
      date_of_death: parseTime("2019-02-10"),
      manner: "homocide", misgendered: true
    },
    {
      name: "Test 3", age: 21, race: "Black",
      gender_identity: "Transgender woman", city: "New Orleans",
      x: 80,
      date_of_death: parseTime("2018-02-10"),
      manner: "homocide", misgendered: true
    },
  ];
  return data;
}

function addPanel(gra) {

  // https://www.kapwing.com/resources/official-pride-colors-2021-exact-color-codes-for-15-pride-flags/
  var flag_data = [
    { fill: '#5BCFFB' }, { fill: '#F5ABB9' }, { fill: '#FFFFFF' },
    { fill: '#F5ABB9' }, { fill: '#5BCFFB' }
  ];

  gra.append("g").selectAll(".transFlag")
    .data(flag_data)
    .join("rect")
    .attr("x", (d, i) => margin.left + i * plot_width / 2 / 5)
    .attr("y", margin.top)
    .attr("width", plot_width / 2 / 5)
    .attr("height", plot_height - margin.bottom)
    .attr("stroke", (d, i) => d.fill)
    .attr("fill", (d, i) => d.fill);

}

function addMarks(gra, dat) {
  gra.append('g').selectAll('.mycirPoint')
    .data(dat)
    .enter()
    .append('circle')
    .attr("cx", function (d) { return x(d.x) / 2 })
    .attr("cy", function (d) { return y(d.date_of_death) })
    .attr("r", 8);

  const rose_radius = 16;
  gra.append('g').selectAll('.myPoint')
    .data(dat)
    .enter()
    .append('svg:image')
    .attr("xlink:href", "assets/rose.svg")
    .attr("x", function (d) { return x(d.x) / 2 - rose_radius })
    .attr("y", function (d) { return y(d.date_of_death) - rose_radius })
    .attr("width", rose_radius * 2)
    .attr("height", rose_radius * 2)
    .attr("fill", "#FFFFFF");

}

function createAnnotationArray() {
  const annotations = [
    {
      id: "test-1",
      note: {
        label: "Here is the annotation label",
        title: "Annotation title"
      },
      data: {
        value: 80,
        date: Date.now() - 2 * 365.25 * 24 * 60 * 60 * 1000
      },
      ny: 0,
      nx: x(100) - x(80),
      subject: { radius: rose_radius, radiusPadding: 10 }
    },
    {
      id: "test-1",
      note: {
        label: "Here is the annotation label",
        title: "Annotation title"
      },
      data: {
        value: 40,
        date: Date.now() - 2 * 365.25 * 24 * 60 * 60 * 1000
      },
      ny: 0,
      nx: x(40),
      subject: { radius: 50, radiusPadding: 10 }
    },

  ];
  return annotations;
}


/**
 * Add annotations to the plot
 */
function addAnnotations(gra, annotations) {
  // https://bl.ocks.org/susielu/63269cf8ec84497920f2b7ef1ac85039
  const makeAnnotations = d3.annotation()
    .type(d3.annotationCalloutCircle)
    .accessors({
      x: d => x(d.value) / 2,
      y: d => y(d.date),
    })
    .on('subjectover', function (annotation) {
      annotation.type.a.selectAll("g.annotation-connector, g.annotation-note")
        .classed("hidden", false)
    })
    .on('subjectout', function (annotation) {
      annotation.type.a.selectAll("g.annotation-connector, g.annotation-note")
        .classed("hidden", true)
    })
    .annotations(annotations)
    ;

  gra.append("g")
    .call(makeAnnotations);

  gra.selectAll("g.annotation-connector, g.annotation-note")
    .classed("hidden", true)
  return gra;

}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/mirrored-beeswarm
function MirroredBeeswarmChart(svg, data, {
  value = d => d, // convience alias for x
  label, // convenience alias for xLabel
  type = d3.scaleLinear,
  domain, // convenience alias for xDomain
  x = value, // given d in data, returns the quantitative x value
  title = null, // given d in data, returns the title
  radius = 3, // (fixed) radius of the circles
  padding = 1.5, // (fixed) padding between the circles
  marginTop = 10, // top margin, in pixels
  marginRight = 20, // right margin, in pixels
  marginBottom = 30, // bottom margin, in pixels
  marginLeft = 20, // left margin, in pixels
  width = 640, // outer width, in pixels
  height, // outer height, in pixels
  xType = type,
  xLabel = label, // a label for the x-axis
  xDomain = domain, // [xmin, xmax]
  xRange = [marginLeft, width - marginRight] // [left, right]
} = {}) {
  // Compute values.
  const X = d3.map(data, x);
  const T = title == null ? null : d3.map(data, title);

  // Compute which data points are considered defined.
  const I = d3.range(X.length).filter(i => !isNaN(X[i]));

  // Compute default domains.
  if (xDomain === undefined) xDomain = d3.extent(X);

  // Construct scales and axes.
  const xScale = xType(xDomain, xRange).nice();
  const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);

  // Compute the y-positions.
  const Y = dodge(I.map(i => xScale(X[i])), radius * 2 + padding);

  // Compute the default height;
  if (height === undefined) height = (d3.max(Y, Math.abs) + radius + padding) * 2 + marginTop + marginBottom;

  // Given an array of x-values and a separation radius, returns an array of y-values.
  function dodge(X, radius) {
    const Y = new Float64Array(X.length);
    const radius2 = radius ** 2;
    const epsilon = 1e-3;
    let head = null, tail = null;

    // Returns true if circle ⟨x,y⟩ intersects with any circle in the queue.
    function intersects(x, y) {
      let a = head;
      while (a) {
        const ai = a.index;
        if (radius2 - epsilon > (X[ai] - x) ** 2 + (Y[ai] - y) ** 2) return true;
        a = a.next;
      }
      return false;
    }

    // Place each circle sequentially.
    for (const bi of d3.range(X.length).sort((i, j) => X[i] - X[j])) {

      // Remove circles from the queue that can’t intersect the new circle b.
      while (head && X[head.index] < X[bi] - radius2) head = head.next;

      // Choose the minimum non-intersecting tangent.
      if (intersects(X[bi], Y[bi] = 0)) {
        let a = head;
        Y[bi] = Infinity;
        do {
          const ai = a.index;
          let y1 = Y[ai] + Math.sqrt(radius2 - (X[ai] - X[bi]) ** 2);
          let y2 = Y[ai] - Math.sqrt(radius2 - (X[ai] - X[bi]) ** 2);
          if (Math.abs(y1) < Math.abs(Y[bi]) && !intersects(X[bi], y1)) Y[bi] = y1;
          if (Math.abs(y2) < Math.abs(Y[bi]) && !intersects(X[bi], y2)) Y[bi] = y2;
          a = a.next;
        } while (a);
      }

      // Add b to the queue.
      const b = { index: bi, next: null };
      if (head === null) head = tail = b;
      else tail = tail.next = b;
    }

    return Y;
  }


  svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(xAxis)
    .call(g => g.append("text")
      .attr("x", width)
      .attr("y", marginBottom - 4)
      .attr("fill", "currentColor")
      .attr("text-anchor", "end")
      .text(xLabel));

  const dot = svg.append("g")
    .selectAll("circle")
    .data(I)
    .join("circle")
    .attr("cx", i => xScale(X[i]))
    .attr("cy", i => (marginTop + height - marginBottom) / 2 + Y[i])
    .attr("r", radius);

  if (T) dot.append("title")
    .text(i => T[i]);

  return svg.node();
}

// set the dimensions and margins of the graph
var canvas_width = 2000,
  canvas_height = 1000;

var margin = { top: 10, right: 40, bottom: 30, left: 30 },
  plot_width = canvas_width - margin.left - margin.right,
  plot_height = canvas_height - margin.top - margin.bottom;

var scatter = d3.select("#scatter_area")
  .append("svg")
  .attr("width", canvas_width)
  .attr("height", canvas_height)
  .attr("viewBox", [0, 0, canvas_width, canvas_height])
  .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");
;


var remembrances = getDataPromise();
remembrances.then(function (data) {
  MirroredBeeswarmChart(scatter, data, {
    width: 2000,
    height: 1000,
    radius: 30,
    value: d => d.date_of_death,
    label: "Year",
    type: d3.scaleTime,
    // domain: [Date.now() - , Date.now() - 5 * 365.24 * 24 * 60 * 60 * 1000],
    // xRange: [0, plot_height]
  });
})

/*
addPanel(scatter);
addMarks(scatter, data);
var annotations = createAnnotationArray();
addAnnotations(scatter, annotations);
*/
