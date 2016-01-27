define('ProcessSchemaEdit', ['ext-base', 'terrasoft', 'sandbox', 'ProcessSchemaEditResources', 'GraphicUtilities'],
	function(Ext, Terrasoft, sandbox, resources, grfUtil) {
			var svgDiagram = null;
			var svgLeftPanel = null;
			var pdDiagramName;
			var pdLeftPanelName;
			var defSettings = {
				width: '3000',
				height: '3000'
			};

			var shapes = [];
			var connections = [];
			var index = 0;

			function drawRectangle(svg, x, y, width, height, id) {
				var settings =  {fill: '#C9DBF2', stroke: 'black', strokeWidth: 2, id: id};
				return svg.rect(x, y, width, height, 5, 5, settings);
			}

			function drawRectangles(svg, countByH, countByV, x, y) {
				x = x || 0;
				y = y || 0;
				var d = 80;
				var rectW = 60;
				var rectH = 40;
				for (var i = 0; i < countByV; i++) {
					for (var j = 0; j < countByH; j++) {
						var lcx = x + d * (j + 1) - rectW / 2;
						var lcy = y + d * (i + 1) - rectH;
						drawRectangle(svg, lcx, lcy, rectW, rectH, index);
						index++;
					}
				}
			}
			
			function drawLines(vert, hor) {
				var count = 1;
				var i;
				for (i = 0; i < vert * hor - 1; i++) {
					if (count === vert) {
						count = 1;
					} else {
						connections.push($.svgDiagram.svg.drawLineFigure(shapes[i], shapes[i + 1]));
						count++;
					}
				}
				count = 0;
				for (i = 0; i < vert * hor - vert; i++) {
					if (count === vert) {
						count = 1;
					}
					var obj1 = shapes[i];
					var obj2 = shapes[i + vert];
					connections.push($.svgDiagram.svg.drawLineFigure(obj1, obj2));
					count++;
				}
			}
		
			var CreateJQuerySVGWrapper = function(svgContainerId, svg) {
				this.svg = svg;
				this.grfUtil = grfUtil;
				this.svgContainerId = svgContainerId;
				this.svgContainer = $("#" + this.svgContainerId);
				this.initEvtDD = function() {
					this.svgContainer.attr("onmousedown", "$." + this.svgContainerId + ".mousedown(evt)");
					this.svgContainer.attr("onmousemove", null);
					this.svgContainer.attr("onmouseup", null);
				};
				this.mousedown = function(evt) {
					if (!evt.target || evt.target.nodeName !== 'rect') {
						return;
					}
                    evt.preventDefault();
					var target = $(evt.target);
					var shapeId;
					var dropable;
					if (this.svgContainerId !== 'svgDiagram') {
						target = this.cloneShape(target);
						shapeId = Terrasoft.generateGUID();
						dropable = false;
						target.attr('id', shapeId);
						target.prependTo(this.svgContainer);
					} else {
						shapeId = target.attr('id');
						dropable = true;
					}
					var onmouseup = "$." + this.svgContainerId + ".mouseup(evt, '" + shapeId + "'," + dropable + ")";
					var offsetX = evt.pageX - target.attr('x');
					var offsetY = evt.pageY - target.attr('y');
					this.assignMouseMoveEvt(shapeId, offsetX, offsetY);
					this.assignMouseUpEvt(shapeId, dropable, false);
				};
				this.mouseup = function(evt, id, dropable, isAdded) {
					this.initEvtDD();
					if (dropable === false) {
						$('#' + id).remove();
					}
					if (isAdded === true) {
						var shape = $('#' + id);
						sandbox.publish('FlowElementAdded', {
							id: id,
							type: 'rect',
							x: shape.attr('x'),
							y: shape.attr('y'),
							width: shape.attr('width'),
							height: shape.attr('height')
						});
					}
				};
				this.mousemove = function(evt, id, parentId, offsetX, offsetY) {
					var shape = $("#" + id);
					var c = "";
					shape.attr(c + "x", evt.pageX - offsetX);
					shape.attr(c + "y", evt.pageY - offsetY);
					if (parentId === 'svgDiagram') {
						return;
					}
					var width = $("#" + parentId).width();
					if (width && evt.pageX - 1 >= width) {
						shape.remove();
						var x  = -1 * shape.attr('width') / 2;
						offsetX = evt.pageX - x;
                        var y = evt.pageY - $.svgDiagram.svgContainer.position().top - shape.attr('height') / 2;
                        offsetY = evt.pageY - y;
						shape.attr('x', x);
                        shape.attr('y', y);
						shape.appendTo($.svgDiagram.svgContainer);
						this.initEvtDD();
						this.assignMouseMoveEvt.call($.svgDiagram, id, offsetX, offsetY);
						this.assignMouseUpEvt.call($.svgDiagram, id, true, true);
					}
				};
				this.assignMouseMoveEvt = function(shapeId, offsetX, offsetY) {
					this.svgContainer.attr("onmousemove", "$." + this.svgContainerId + ".mousemove(evt, '" +
						shapeId + "\', " + "\'" + this.svgContainerId + "\'," +
						offsetX.toString() + "," + offsetY.toString() + ")");
				};
				this.assignMouseUpEvt = function(shapeId, dropable, isAdded) {
					this.svgContainer.attr("onmouseup", "$." + this.svgContainerId + ".mouseup(evt,'" + shapeId + "'," +
						dropable + "," + isAdded + ")");
				};
				this.assignAttr = function(jobj, attributes) {
					for (var attribute in attributes) {
						jobj.attr(attribute, attributes[attribute]);
					}
				};
				this.getLineFigurePath = function(points) {
					return this.svg.createPath().move(points.x1.toFixed(3), points.y1.toFixed(3))
						.curveC(points.x2, points.y2, points.x3, points.y3, points.x4.toFixed(3),
							points.y4.toFixed(3));
				};
				this.drawLineFigure = function(shape1, shape2) {
					var bb1 = shape1.getBBox();
					var bb2 = shape2.getBBox();
					var p = this.grfUtil.getPathPoints(bb1.x, bb1.y, bb1.width, bb1.height,
						bb2.x, bb2.y, bb2.width, bb2.height);
					var path = this.getLineFigurePath(p);
					return {
						line: this.svg.path(path, {stroke: "#000", fill: "none"}),
						from: shape1,
						to: shape2
					};
				};
				this.cloneShape = function(shape) {
					return $(shape).clone();
				};
			};

			function initSvgDiagram(containerId, onLoadSvg, settings) {
				$("#" + containerId).svg({onLoad: onLoadSvg, settings: settings});
				$.extend({
					svgDiagram: new CreateJQuerySVGWrapper(settings.id, this.svgDiagram)
				});
				$.svgDiagram.initEvtDD();
			}
			
			function initSvgLeftPanel(containerId, onLoadSvg, settings) {
				$("#" + containerId).svg({onLoad: onLoadSvg, settings: settings});
				$.extend({
					svgLeftPanel: new CreateJQuerySVGWrapper(settings.id, this.svgLeftPanel)
				});
				$.svgLeftPanel.initEvtDD();
			}
			
			function onSvgDiagramLoad() {
				svgDiagram = $("#" + pdDiagramName).svg('get');
			}
			
			function onSvgLeftPanelLoad() {
				svgLeftPanel = $("#" + pdLeftPanelName).svg('get');
			}
			
			function onLoadProcessDesigner(args) {
				pdDiagramName = args.pdDiagramName;
				pdLeftPanelName = args.pdLeftPanelName;
				initSvgDiagram(pdDiagramName, onSvgDiagramLoad,
					{ id: 'svgDiagram' });
				initSvgLeftPanel(pdLeftPanelName, onSvgLeftPanelLoad,
					{ id: 'svgLeftPanel' });
				drawRectangles(svgLeftPanel, 1, 1);
			}

			function onLoadProcessSchema(args) {
				var flowElements = args.flowElements;
				if (flowElements) {
					for (var flowEl in flowElements) {
						var el = flowElements[flowEl];
						drawRectangle(svgDiagram,
							el.position.x, el.position.y, el.size.width, el.size.height, el.uid);
					}
				}
			}

			return  {
				init: function() {
					require(['jQuery'], function() {
						require(['jQuerySVG'], function() {
							sandbox.subscribe('LoadProcessSchema', onLoadProcessSchema);
							onLoadProcessDesigner(sandbox.publish('LoadProcessDesigner'));
							sandbox.publish('LoadProcessSchemaEdit');
						});
					});
				}
			};
		});