/**
 * -D- Название оси; 
*/
var Axis = React.createClass({
    propTypes: {
        h:			React.PropTypes.number,
        axis:		React.PropTypes.func,
        axisType:	React.PropTypes.oneOf(['x','y'])
    },
    componentDidUpdate: function () { this.renderAxis(); },
    componentDidMount: function () { this.renderAxis(); },
    renderAxis: function () {
        var node = ReactDOM.findDOMNode(this);
        d3.select(node).call(this.props.axis);
    },
    render: function () {

        var translate = "translate(0,"+(this.props.h)+")";

        return (
            <g className="axis" transform={this.props.axisType=='x'?translate:""} ></g>
        );
    }
});
/**
 * -D- Точки на диаграмме; 
*/
var Dots = React.createClass({
    propTypes: {
        data:	React.PropTypes.array,
        x:		React.PropTypes.func,
        y:		React.PropTypes.func,
		r:		React.PropTypes.number
    },
    render: function(){
        var self  = this;

        var circles = this.props.data.map( function(d, i) {
			var k = i + '_dots';
            return (
				<g key={k}>
					<text x={self.props.x(d.date)-18} y={self.props.y(d.close)-8}>{d.label.replace('{c}', d3.format("(.2f")(d.close))}</text>
					<circle r={self.props.r} cx={self.props.x(d.date)} cy={self.props.y(d.close)}/>
				</g>
			)				
        });

        return(
            <g>
                {circles}
            </g>
        );
    }
});

/**
 * -D- Линейная диаграмма; 
*/
var LineChart = React.createClass({
	propTypes: {
		width:		React.PropTypes.number,
		height:		React.PropTypes.number,
		chartId:	React.PropTypes.string
	},
    getDefaultProps: function() {
        return {
            width:		800,
            height: 	300,
            chartId: 	'LineChart',
			csv:		'data.csv'
        };
    },
	change_type: function(e) {
		document.title = e.target.value;
		this.setState({type: e.target.value});
	},
	change_dateType: function(e) {
		this.setState({dateType: e.target.value});
	},
    getInitialState:function(){
		var date = new Date(), y = date.getFullYear(), m = date.getMonth();
		var start_w = this.getMonday(date);
		var start_m = new Date(y, m, 1);
		var start_y = new Date(y, 0, 1);
        return {
			dataTypes:	[],
			types:		[],
			type: 		'',
			dateTypes:	[
				{val: 'w', name: 'Неделя', start: start_w}, 
				{val: 'm', name: 'Месяц', start: start_m}, 
				{val: 'y', name: 'Год', start: start_y}
			],
			dateType:	'w'
        };
    },
	getMonday: function(d) {
		d = new Date(d);
		var day = d.getDay(),
	  	diff = d.getDate() - day + (day == 0 ? -6:1);
		return new Date(d.setDate(diff));
	},
	componentDidMount: function() {
		var self = this;
		d3.csv(this.props.csv, function(error, data) {
			if(error) 
				throw error;
				
			var dataTypes = [];
			var types = [];
			var parseTime = d3.timeParse("%d-%b-%y");
			data.forEach(function(d) {
				d.date = parseTime(d.date);
				d.close = +d.close;
				if(types.indexOf(d.type) == -1)
					types.push(d.type);
				if(typeof dataTypes[d.type] == 'undefined')
					dataTypes[d.type] = [];
				dataTypes[d.type].push(d);
			});
			self.setState({
				'dataTypes':	dataTypes,
				'types':		types,
				'type':			types[0]
			});
		});
	},
    render:function() {
		var self = this;
		var data = [];
        var margin = {top: 50, right: 50, bottom: 50, left: 50},
            width = this.props.width - (margin.left + margin.right),
            height = this.props.height - (margin.top + margin.bottom);

		var r = 5;
		var x = d3.scaleTime().range([0, width]);
		var y = d3.scaleLinear().range([height, 0]);
		
        var yAxis = d3.axisLeft(y);
		var xAxis = d3.axisBottom(x);
		
		var line = d3.line()
			.x(function(d) { return x(d.date); })
			.y(function(d) { return y(d.close); });
		
		var dataType = (
			typeof this.state.dataTypes[this.state.type]=='undefined'?
			[]: 
			this.state.dataTypes[this.state.type]
		);
		this.state.dateTypes.forEach(function(t) {
			if(t.val == self.state.dateType) {
				dataType.forEach(function(d) {
					if(d.date >= t.start) {
						data.push(d);
					}
				});
			}
		});

        var type_options = this.state.types.map( function(t, i) {
			var k = i + '_type_options';
            return (
				<option key={k}>{t}</option>
			)				
        });
        var date_radios = this.state.dateTypes.map( function(r, i) {
			var k = i + '_date_radios';
			var checked = (self.state.dateType == r.val);
            return (
				<label key={k}><input onChange={self.change_dateType} defaultChecked={checked} name="date_radios" type="radio" value={r.val} key={k}/>{r.name}</label>
			)				
        });
		
		x.domain(d3.extent(data, function(d) { return d.date; })).ticks(d3.timeDay.every(1));
		y.domain([d3.min(data, function(d) { return d.close; })-2, d3.max(data, function(d) { return d.close; })+2]);
		
		
		var transform = 'translate(' + margin.left + ',' + margin.top + ')';

		return (
			<div>
				<select onChange={this.change_type}>
					{type_options}
				</select>
				<div>
					{date_radios}
				</div>
				<br/>
				<svg id={this.props.chartId} width={this.props.width} height={this.props.height}>
					<g transform={transform}>
                        <Axis h={height} axis={yAxis} axisType="y"/>
						<Axis h={height} axis={xAxis} axisType="x"/>
						
						<path className="line" d={line(data)}/>
						<Dots data={data} x={x} y={y} r={r}/>
					</g>
				</svg>
			</div>
		);
    }


});

window.LineChart = LineChart;