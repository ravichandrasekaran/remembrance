function getData() {
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


// set the dimensions and margins of the graph
var canvas_width = 1000,
  canvas_height = 1000;

var margin = { top: 10, right: 40, bottom: 30, left: 30 },
  plot_width = canvas_width - margin.left - margin.right,
  plot_height = canvas_height - margin.top - margin.bottom;

var scatter = d3.select("#scatter_area")
  .append("svg")
  .attr("width", canvas_width)
  .attr("height", canvas_height)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

// X scale and axis
// TODO: Set up as bands to allow easier jitter.
https://www.d3-graph-gallery.com/graph/violin_jitter.html
var x = d3.scaleLinear()
  .domain([0, 100])
  .range([0, plot_width]);

// Y scale and axis
var y = d3.scaleTime()
  .domain([Date.now(), Date.now() - 5 * 365.24 * 24 * 60 * 60 * 1000])
  .range([0, plot_height])
  .nice();
scatter
  .append('g')
  .call(d3.axisLeft(y));






data = getData();
addPanel(scatter);
addMarks(scatter, data);
var annotations = createAnnotationArray();
addAnnotations(scatter, annotations);

/*
        // https://bl.ocks.org/susielu/63269cf8ec84497920f2b7ef1ac85039


        //Add annotations
        const labels = data.map(l => {
            l.note = Object.assign({}, l.note, {
                title: `Close: ${l.x}`,
                label: `${l.y}`
            })
            l.dx = 100
            l.dy = 100
            l.subject = { radius: 10 }

            return l
        })

        const timeFormat = d3.timeFormat("%d-%b-%y")

        window.makeAnnotations = d3.annotation()
            .annotations(labels)
            .type(d3.annotationCalloutCircle)
            .accessors({
                y: d => y(d.y),
                x: d => x(d.x)
            })
            .accessorsInverse({
                date: d => timeFormat(y.invert(d.y)),
                close: x => y.invert(d.x)
            })
            .on('subjectover', function (annotation) {
                annotation.type.a.selectAll("g.annotation-connector, g.annotation-note")
                    .classed("hidden", false)
            })
            .on('subjectout', function (annotation) {
                annotation.type.a.selectAll("g.annotation-connector, g.annotation-note")
                    .classed("hidden", true)
            })

        svg.append("g")
            .attr("class", "annotation-test")
            .call(makeAnnotations)

        svg.selectAll("g.annotation-connector, g.annotation-note")
            .classed("hidden", false)
    */
