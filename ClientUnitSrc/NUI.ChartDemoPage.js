define('ChartDemoPage', ["ext-base", "terrasoft", "HighchartsWrapper"], function(Ext, Terrasoft) {
	return {
		"render": function(renderTo) {
			Ext.create('Terrasoft.Container', {
				id: 'chartContainer',
				selectors: {
					wrapEl: '#chartContainer'
				},
				renderTo: renderTo,
				tpl: [
					'<div id="{id}" class="menu-holder">',
					'<tpl for="items">',
					'<@item>',
					'</tpl>',
					'</div>'
				],
// http://www.highcharts.com/demo
				items: [
					{
						className: 'Terrasoft.Chart',
						renderTo: renderTo,
						chartConfig: {
							chart: {
								type: 'line',
								marginRight: 130,
								marginBottom: 25
							},
							title: {
								text: 'Monthly Average Temperature',
								x: -20 //center
							},
							subtitle: {
								text: 'Source: WorldClimate.com',
								x: -20
							},
							xAxis: {
								categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
									'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
							},
							yAxis: {
								title: {
									text: 'Temperature (°C)'
								},
								plotLines: [
									{
										value: 0,
										width: 1,
										color: '#808080'
									}
								]
							},
							tooltip: {
								valueSuffix: '°C'
							},
							legend: {
								layout: 'vertical',
								align: 'right',
								verticalAlign: 'top',
								x: -10,
								y: 100,
								borderWidth: 0
							},
							series: [
								{
									name: 'Tokyo',
									data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
								},
								{
									name: 'New York',
									data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
								},
								{
									name: 'Berlin',
									data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
								},
								{
									name: 'London',
									data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
								}
							]
						}
					}, {
						className: 'Terrasoft.Chart',
						renderTo: renderTo,
						chartConfig: {
							chart: {
								type: 'column'
							},
							title: {
								text: 'Monthly Average Rainfall'
							},
							subtitle: {
								text: 'Source: WorldClimate.com'
							},
							xAxis: {
								categories: [
									'Jan',
									'Feb',
									'Mar',
									'Apr',
									'May',
									'Jun',
									'Jul',
									'Aug',
									'Sep',
									'Oct',
									'Nov',
									'Dec'
								]
							},
							yAxis: {
								min: 0,
								title: {
									text: 'Rainfall (mm)'
								}
							},
							tooltip: {
								headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
								pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
									'<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
								footerFormat: '</table>',
								shared: true,
								useHTML: true
							},
							plotOptions: {
								column: {
									pointPadding: 0.2,
									borderWidth: 0
								}
							},
							series: [
								{
									name: 'Tokyo',
									data: [49.9, 71.5, 106.4, 129.2, 144, 176, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]
								},
								{
									name: 'New York',
									data: [83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5, 106.6, 92.3]
								},
								{
									name: 'London',
									data: [48.9, 38.8, 39.3, 41.4, 47.0, 48.3, 59.0, 59.6, 52.4, 65.2, 59.3, 51.2]
								},
								{
									name: 'Berlin',
									data: [42.4, 33.2, 34.5, 39.7, 52.6, 75.5, 57.4, 60.4, 47.6, 39.1, 46.8, 51.1]
								}
							]
						}
					}, {
						className: 'Terrasoft.Chart',
						renderTo: renderTo,
						chartConfig: {
							chart: {
								type: 'area'
							},
							title: {
								text: 'Historic and Estimated Worldwide Population Growth by Region'
							},
							subtitle: {
								text: 'Source: Wikipedia.org'
							},
							xAxis: {
								categories: ['1750', '1800', '1850', '1900', '1950', '1999', '2050'],
								tickmarkPlacement: 'on',
								title: {
									enabled: false
								}
							},
							yAxis: {
								title: {
									text: 'Billions'
								},
								labels: {
									formatter: function() {
										return this.value / 1000;
									}
								}
							},
							tooltip: {
								shared: true,
								valueSuffix: ' millions'
							},
							plotOptions: {
								area: {
									stacking: 'normal',
									lineColor: '#666666',
									lineWidth: 1,
									marker: {
										lineWidth: 1,
										lineColor: '#666666'
									}
								}
							},
							series: [
								{
									name: 'Asia',
									data: [502, 635, 809, 947, 1402, 3634, 5268]
								},
								{
									name: 'Africa',
									data: [106, 107, 111, 133, 221, 767, 1766]
								},
								{
									name: 'Europe',
									data: [163, 203, 276, 408, 547, 729, 628]
								},
								{
									name: 'America',
									data: [18, 31, 54, 156, 339, 818, 1201]
								},
								{
									name: 'Oceania',
									data: [2, 2, 2, 6, 13, 30, 46]
								}
							]
						}
					}, {
						className: 'Terrasoft.Chart',
						renderTo: renderTo,
						chartConfig: {
							chart: {
								plotBackgroundColor: null,
								plotBorderWidth: null,
								plotShadow: false
							},
							title: {
								text: 'Browser market shares at a specific website, 2010'
							},
							tooltip: {
								pointFormat: '{series.name}: <b>{point.percentage}%</b>',
								percentageDecimals: 1
							},
							plotOptions: {
								pie: {
									allowPointSelect: true,
									cursor: 'pointer',
									dataLabels: {
										enabled: true,
										color: '#000000',
										connectorColor: '#000000',
										formatter: function() {
											return '<b>' + this.point.name + '</b>: ' + this.percentage + ' %';
										}
									}
								}
							},
							series: [
								{
									type: 'pie',
									name: 'Browser share',
									data: [
										['Firefox', 45.0],
										['IE', 26.8],
										{
											name: 'Chrome',
											y: 12.8,
											sliced: true,
											selected: true
										},
										['Safari', 8.5],
										['Opera', 6.2],
										['Others', 0.7]
									]
								}
							]
						}
					}
				]
			});
		}
	};
});