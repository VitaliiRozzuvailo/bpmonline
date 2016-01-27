/* global ej: false */
/* jshint bitwise: false */
define("RelationshipDiagram", ["terrasoft", "ext-base", "RelationshipDiagramResources", "diagram", "ej-diagram",
			"css!RelationshipDiagram"],
		function(Terrasoft, Ext, resources) {

			/**
			 * Миксин, реализующий инструмент для выделения элементов на схеме диаграммы.
			 */
			Ext.define("Terrasoft.diagram.userHandles.RelationshipNodeSelectionTool", {
				extend: "Terrasoft.NodeSelectionTool",
				alternateClassName: "Terrasoft.RelationshipNodeSelectionTool",

				/**
				 * Инструмент выделения.
				 * @type {Object}
				 */
				nodeSelectionHandle: null,

				/**
				 * Радиус углов выделения.
				 * @type {Number}
				 */
				cornerRadius: 10,

				/**
				 * @inheritdoc Terrasoft.NodeSelectionTool#getNodeSelectionTool
				 * @overridden
				 */
				getNodeSelectionTool: function() {
					if (this.nodeSelectionHandle) {
						return this.nodeSelectionHandle;
					}
					var nodeSelectionHandle = this.callParent(arguments);
					Ext.apply(nodeSelectionHandle, {
						cornerRadius: this.cornerRadius
					});
					var SelectMoveTool = this.customMoveTool(ej.Diagram.SelectTool);
					nodeSelectionHandle.tool = new SelectMoveTool(null);
					return nodeSelectionHandle;
				},

				/**
				 * @inheritdoc Terrasoft.NodeSelectionTool#nodeSelectionRenderUserHandle
				 * @overridden
				 */
				nodeSelectionRenderUserHandle: function(handle, node, svg, scale, parent, diagram) {
					if (node.tools.indexOf(handle.name) < 0) {
						return;
					}
					var g = svg.g({
						id: svg.document.id + "userHandle_g",
						class: "userHandle"
					});
					parent.appendChild(g);
					var position = ej.datavisualization.Diagram.Point();
					var bounds = ej.datavisualization.Diagram.Util.bounds(node);
					var offset = 10;
					position.x = bounds.topLeft.x - offset / 2;
					position.y = bounds.topLeft.y - offset / 2;
					var shapeAttr = {
						id: handle.name + "_shape",
						class: "userHandle",
						x: position.x,
						y: position.y,
						rx: handle.cornerRadius,
						ry: handle.cornerRadius,
						width: node.width + offset,
						height: node.height + offset,
						fill: diagram.selectionColor,
						title: handle.name
					};
					g.appendChild(svg.rect(shapeAttr));
				}
			});

			/**
			 * Миксин, реализующий инструмент для удаления элементов на схеме диаграммы.
			 */
			Ext.define("Terrasoft.diagram.userHandles.RelationshipNodeRemoveTool", {
				extend: "Terrasoft.NodeRemoveTool",
				alternateClassName: "Terrasoft.RelationshipNodeRemoveTool",

				/**
			 	* Модель представления инструмента.
			 	* @type {Object}
			 	*/
				model: null,

				/**
				 * Инструмент удаления.
				 * @type {Object}
				 */
				nodeRemoveHandle: null,

				/**
				 * Идентификатор svg изображения инструмента для удаления ноды.
				 * @type {Guid}
				 */
				removeToolImageId: "288fea65-cdbe-4eee-9416-47c7602a4d5c",

				/**
				 * @inheritdoc Terrasoft.NodeRemoveTool#getNodeRemoveTool
				 * @overridden
				 */
				getNodeRemoveTool: function() {
					if (this.nodeRemoveHandle) {
						return this.nodeRemoveHandle;
					}
					var nodeRemoveHandle = this.callParent(arguments);
					Ext.apply(nodeRemoveHandle, {
						imageId: this.removeToolImageId,
						showOnInPort: true
					});
					return nodeRemoveHandle;
				},

				/**
				 * @inheritdoc Terrasoft.NodeRemoveTool#nodeRemoveTool
				 * @overridden
				 */
				nodeRemoveTool: function(base) {
					var tool = this.callParent(arguments);
					var model = this.model;
					tool.prototype.mouseup = function(evt) {
						var diagram = this.diagram;
						if (diagram.selectionList.length === 1 && model) {
							model.onRemoveParentRelationshipButtonClick(diagram.selectionList[0]);
						}
						base.prototype.mouseup.call(this, evt);
					};
					return tool;
				},

				/**
				 * @inheritdoc Terrasoft.NodeRemoveTool#nodeRemoveRenderUserHandle
				 * @overridden
				 */
				nodeRemoveRenderUserHandle: function(handle, node, svg, scale, parent, diagram) {
					if (node.tools.indexOf(handle.name) < 0) {
						return;
					}
					if (diagram.nodeToolRenderUserHandle) {
						diagram.nodeToolRenderUserHandle(handle, node, svg, scale, parent, diagram);
					}
				}
			});

			/**
			 * Миксин, реализующий инструмент для добавления элементов на схеме диаграммы.
			 */
			Ext.define("Terrasoft.diagram.userHandles.RelationshipNodeAddTool", {
				alternateClassName: "Terrasoft.RelationshipNodeAddTool",

				/**
			 	* Модель представления инструмента.
			 	* @type {Object}
			 	*/
				model: null,

				/**
				 * Инструмент добавления.
				 * @type {Object}
				 */
				nodeAddHandle: null,

				/**
				 * Идентификатор svg изображения инструмента для добавления ноды.
				 * @type {Guid}
				 */
				addToolImageId: "8042022e-8d77-45c5-abab-89169089c473",

				/**
				 * Возвращает обработчик отображения для добавления узлов.
				 * @return {Object} Экземпляр обработчика.
				 */
				getNodeAddTool: function() {
					if (this.nodeAddHandle) {
						return this.nodeAddHandle;
					}
					var addNodeHandle = this.addNodeHandle = ej.Diagram.UserHandle({
						XLINK_NAMESPACE: "http://www.w3.org/1999/xlink",
						XLINK_ATTRIBUTE: "xlink:href",
						name: "NodeAddHandle",
						TOOL_SIZE: 21,
						position: {
							x: 0,
							y: 0
						},
						constraint: Terrasoft.diagram.UserHandlesConstraint.Node,
						enableMultiSelection: false,
						imageId: this.addToolImageId,
						showOnOutPort: true,
						enableContextMenu: true,
						contextMenu: {
							items: [{
								markerValue: "addParent",
								caption: resources.localizableStrings.AddParentMenuItemCaption,
								tag: "onAddParentAccountButtonClick"
							}, {
								markerValue: "addChild",
								caption: resources.localizableStrings.AddChildMenuItemCaption,
								tag: "onAddChildAccountButtonClick"
							}]
						}
					});
					var CustomSelectTool = this.customSelectTool(ej.Diagram.SelectTool);
					addNodeHandle.renderUserHandle = this.nodeAddRenderUserHandle;
					addNodeHandle.tool = new CustomSelectTool(null);
					return addNodeHandle;
				},

				/**
				 * Обработчик отображения для добавления узлов.
				 * @param {Object} base Базовый объект инструмента.
				 * @return {Object} Экземпляр обработчика.
				 */
				customSelectTool: function(base) {
					function tool(diagram) {
						base.call(this, diagram);
					}
					ej.Diagram.extend(tool, base);
					var model = this.model;
					tool.prototype.mouseup = function(evt) {
						var diagram = this.diagram;
						if (diagram.selectionList.length === 1 && model) {
							var selectedNode = diagram.selectionList[0];
							if (!selectedNode.parentId || selectedNode.parentId === Terrasoft.GUID_EMPTY) {
								var wrapEl = Ext.get("NodeAddHandle_shape");
								if (wrapEl && this.menu) {
									if (this.inAction) {
										diagram._isDropped = false;
										this._endAction();
									}
									var box = wrapEl.getBox();
									box.x += 5;
									box.bottom += 7;
									this.menu.show(box);
								}
							} else {
								model.onAddChildAccountButtonClick(selectedNode);
								base.prototype.mouseup.call(this, evt);
								this.prepareLookup();
							}
						}
					};
					tool.prototype.prepareLookup = function() {
						var diagram = this.diagram;
						var lookupNode;
						Terrasoft.each(diagram.nodes(), function(node) {
							if (node.lookup) {
								lookupNode = node;
								return false;
							}
						}, this);
						if (lookupNode) {
							diagram._clearSelection();
							diagram._addSelection(lookupNode);
							var diagramElement = diagram.element[0];
							if (diagramElement) {
								// Скроллим к добавленному элементу
								if (diagramElement.clientWidth < lookupNode.offsetX) {
									diagramElement.scrollLeft = lookupNode.offsetX;
								}
								if (diagramElement.clientHeight < lookupNode.offsetY) {
									diagramElement.scrollTop = lookupNode.offsetY;
								}
							}
						}
					};
					tool.prototype.menuItemClick = function(tag) {
						var diagram = this.diagram;
						if (model && diagram.selectionList.length === 1) {
							model[tag].apply(model, [diagram.selectionList[0]]);
						}
						this.prepareLookup();
					};
					return tool;
				},

				/**
				 * Рисует инструмент.
				 * @protected
				 * @param {Object} handle Инструмент.
				 * @param {Object} node Нода.
				 * @param {Object} svg Svg контейнер.
				 * @param {Object} scale Маштаб.
				 * @param {Object} parent Родитель.
				 * @param {Object} diagram Диаграмма
				 */
				nodeAddRenderUserHandle: function(handle, node, svg, scale, parent, diagram) {
					if (node.tools.indexOf(handle.name) < 0) {
						return;
					}
					if (diagram.nodeToolRenderUserHandle) {
						diagram.nodeToolRenderUserHandle(handle, node, svg, scale, parent, diagram);
					}
				}
			});

			/**
			 * @class Terrasoft.configuration.RelationshipDiagram
			 * Класс диаграммы взаимосвязей.
			 */
			Ext.define("Terrasoft.configuration.RelationshipDiagram", {
				extend: "Terrasoft.Diagram",
				alternateClassName: "Terrasoft.RelationshipDiagram",

				mixins: {
					nodeSelectionTool: "Terrasoft.RelationshipNodeSelectionTool",
					nodeRemoveTool: "Terrasoft.RelationshipNodeRemoveTool",
					nodeAddTool: "Terrasoft.RelationshipNodeAddTool"
				},

				/**
				 * Выключает автоскроллинг у контейнера диаграммы.
				 * @type {Boolean}
				 */
				autoScroll: false,

				/**
				 * Отступ от ноды до скроллбара.
				 * @type {Number}
				 */
				nodeMargin: 24,

				/**
				 * Цвет выделенния.
				 * @type {String}
				 */
				selectionColor: "rgba(125, 158, 226, 0.2)",

				/**
				 * @inheritdoc Terrasoft.Diagram#nodeTemplate
				 * @overridden
				 */
				nodeTemplate: function(node) {
					if (!Ext.isEmpty(node)) {
						var shape = node.shape;
						if (shape && shape.type === ej.datavisualization.Diagram.Shapes.Image && shape.imageId) {
							shape.src = this.getImageSrc(shape.imageId);
						}
						this.nodePortsTemplate(node);
					}
				},

				/**
				 * Вызывается для кастомизации внешнего вида портов ноды перед рендерингом.
				 * @protected
				 * @param {Object} node Нода диаграммы.
				 */
				nodePortsTemplate: function(node) {
					Terrasoft.each(node.ports, function(port) {
						port.visibility = port.visibility || ej.Diagram.PortVisibility.Hidden;
					}, this);
				},

				/**
				 * @inheritdoc Terrasoft.Diagram#setDefaults
				 * @overridden
				 */
				setDefaults: function() {
					this.callParent(arguments);
					this.connectorConstraints = ej.Diagram.ConnectorConstraints.Delete;
					this.nodeConstraints = ej.Diagram.NodeConstraints.Connect | ej.Diagram.NodeConstraints.Delete |
						ej.Diagram.NodeConstraints.Select;
				},

				/**
				 * @inheritdoc Terrasoft.Diagram#getDiagramConfig
				 * @overridden
				 */
				getDiagramConfig: function() {
					var diagramConfig = this.callParent(arguments);
					Ext.apply(diagramConfig.diagram, {
						tool: ej.datavisualization.Diagram.Tool.None
					});
					return diagramConfig;
				},

				/**
				 * @inheritdoc Terrasoft.Diagram#customizeDiagram
				 * @overridden
				 */
				customizeDiagram: function() {
					this.callParent(arguments);
					this.customizeRenderConnector();
					this.customizeRenderLabel();
					this.customizeWrapText();
					this.customizeRenderLookup();
					this.customizeSetScrollContentSize();
				},

				/**
				 * Перекрывает отрисовку коннектора.
				 * @protected
				 */
				customizeRenderConnector: function() {
					var svgContext = ej.Diagram.SvgContext;
					var baseRenderConnector = svgContext.renderConnector;
					svgContext.renderConnector = function(connector, svg) {
						baseRenderConnector.apply(this, arguments);
						var attr = {
							id: connector.name + "segments",
							style: "shape-rendering: crispEdges;"
						};
						var segments = svg.element(attr);
						if (segments) {
							ej.datavisualization.Diagram.Util.attr(segments, attr);
						}
					};
				},

				/**
				 * Перекрывает отрисовку лейблов.
				 * @protected
				 */
				customizeRenderLabel: function() {
					var svgContext = ej.Diagram.SvgContext;
					var scope = this;
					var baseRenderLabel = svgContext._renderLabel;
					svgContext._renderLabel = function(node, label, svg) {
						baseRenderLabel.apply(this, arguments);
						if (label.isLink) {
							var lbAttr = {
								id: node.name + "_" + label.name + "_lblbg",
								cursor: "pointer"
							};
							var labelBackground = svg.element(lbAttr);
							if (labelBackground) {
								ej.datavisualization.Diagram.Util.attr(labelBackground, lbAttr);
								var model = scope.model;
								if (model) {
									$(labelBackground).click(function() {
										scope.diagram._clearSelection();
										model.onLabelLinkClick(node, label);
									});
								}
							}
						}
					};
				},

				/**
				 * Перекрывает разделение подписей на несколько строк.
				 * @protected
				 */
				customizeWrapText: function() {
					var baseWrapText = ej.Diagram.SvgContext._wrapText;
					ej.Diagram.SvgContext._wrapText = function(node, textBBox, text, label, svg) {
						var appendLine = function(newWord) {
							var tspan = svg.tspan({
								nodeName: node.name
							});
							text.appendChild(tspan);
							line = newWord;
							tspan.textContent = line;
							lineCount++;
							wordsInLineCount = 0;
						};
						var trimLine = function() {
							for (var i = line.length - 1; i > 0; i--) {
								line = line.substr(0, i);
								tspan.textContent = line;
								tempWidth = tspan.getComputedTextLength();
								if (tempWidth <= maxWidth) {
									tspan.textContent = line.substr(0, line.length - 3) + "...";
									break;
								}
							}
						};
						if (label.defaultRendering === true) {
							return baseWrapText.apply(this, arguments);
						}
						var str = label.text;
						while (text.hasChildNodes()) {
							text.removeChild(text.lastChild);
						}
						var tspan;
						var childNodes = text.childNodes;
						if (childNodes && (str.length > 0)) {
							var maxWidth = label.width;
							var lineCount = 1;
							var words = str.match(/(\S+)|(\s+)/g);
							var wordsInLineCount = 0;
							var line = "";
							var tempWidth;
							tspan = svg.tspan({
								nodeName: node.name
							});
							tspan.style.fontSize = label.fontSize;
							text.appendChild(tspan);
							var wordsLength = words.length;
							for (var n = 0; n < wordsLength && lineCount < 3; n++) {
								tspan = childNodes[childNodes.length - 1];
								var tempLine = line + words[n];
								if (lineCount === 2) {
									tempLine = line + words.slice(n, words.length).join("");
									line = tempLine;
								}
								tspan.textContent = tempLine;
								tempWidth = tspan.getComputedTextLength();
								var isLineOverflow = tempWidth > maxWidth;
								if ((isLineOverflow && (wordsInLineCount === 1)) || lineCount === 2) {
									if (isLineOverflow) {
										trimLine();
									}
									appendLine(Ext.emptyString);
									continue;
								}
								if (isLineOverflow && (n > 0)) {
									tspan.textContent = line;
									appendLine(Ext.emptyString);
									line = words[n];
									lineCount = 2;
									wordsLength++;
								} else {
									line = tempLine;
									tspan.textContent = line;
									wordsInLineCount++;
								}
							}
							tempWidth = tspan.getComputedTextLength();
							line = tspan.textContent;
							if (tempWidth > maxWidth) {
								trimLine();
							}
							this._wrapTextAlign(text, childNodes, label.fontSize, label.textAlign);
						}
					};
				},

				/**
				 * @inheritdoc Terrasoft.Diagram#customizeDiagram
				 * @overridden
				 */
				customizeRenderNode: function() {
					this.callParent(arguments);
					var svgContext = ej.Diagram.SvgContext;
					var baseRenderNode = svgContext._renderNode;
					svgContext._renderNode = function(node, svg, g) {
						baseRenderNode.apply(this, arguments);
						this._renderLookup(node, svg, g);
					};
				},

				/**
				 * Перекрывает отрисовку справочного поля.
				 * @protected
				 */
				customizeRenderLookup: function() {
					var svgContext = ej.Diagram.SvgContext;
					var scope = this;
					svgContext._renderLookup = function(node, svg) {
						var model = scope.model;
						if (model && !node.lookup && node.lookupConfig) {
							var controlWidth = node.lookupWidth;
							var controlHeight = node.lookupHeight;
							var x = node.offsetX - controlWidth / 2;
							var y = node.offsetY - controlHeight / 2;
							var style = "width:" + controlWidth + "px;left:" + x + "px; top:" + y + "px; ";
							style += "display: block; border:0px; position: absolute; pointer-events: auto";
							var attr = {
								id: node.name + "_html",
								class: "foreignObject",
								style: style
							};
							var div = document.createElement("div");
							ej.datavisualization.Diagram.Util.attr(div, attr);
							var parentdiv = document.createElement("div");
							var parentAttr = {
								id: node.name + "_parentdiv",
								class: "ej-d-node"
							};
							ej.datavisualization.Diagram.Util.attr(div, {class: "control-width-15 control-left"});
							ej.datavisualization.Diagram.Util.attr(parentdiv, parentAttr);
							parentdiv.appendChild(div);
							var htmlLayer = svg.document.parentNode.getElementsByClassName("htmlLayer")[0];
							if (htmlLayer) {
								htmlLayer.appendChild(parentdiv);
							} else {
								svg.document.parentNode.appendChild(div);
							}
							var divEl = Ext.get(attr.id);
							var diagram = scope.diagram;
							var lookupConfig = {};
							if (diagram) {
								lookupConfig = {
									listeners: {
										focus: function() {
											diagram._addSelection(node);
										}
									}
								};
							}
							var lookupEdit = Ext.create("Terrasoft.LookupEdit",
									Ext.apply(node.lookupConfig, lookupConfig));
							lookupEdit.bind(model);
							lookupEdit.render(divEl);
							lookupEdit.setFocused(true);
							node.lookup = lookupEdit;
						}
					};
				},

				/**
				 * Перекрывает расчет размера контента.
				 * @protected
				 */
				customizeSetScrollContentSize: function() {
					var scope = this;
					ej.Diagram.ScrollUtil._setScrollContentSize = function(diagram) {
						var viewPort = ej.Diagram.ScrollUtil._viewPort(diagram);
						viewPort = ej.Diagram.Rectangle(
								diagram._hScrollOffset, diagram._vScrollOffset, viewPort.width, viewPort.height);
						var left = diagram._spatialSearch.pageLeft;
						var right = diagram._spatialSearch.pageRight;
						var top = diagram._spatialSearch.pageTop;
						var bottom = diagram._spatialSearch.pageBottom;
						var diagramArea = ej.Diagram.Rectangle(0, 0, 0, 0);
						diagramArea = this._union(diagramArea,
								ej.Diagram.Rectangle(0, 0, viewPort.width, viewPort.height));
						var diagramRect = [{
							x: left,
							y: top
						}, {
							x: right,
							y: bottom
						}];
						diagramArea = this._union(diagramArea, ej.Diagram.Geometry.rect(diagramRect));
						var oldAreaSize = diagram.oldAreaSize;
						if (oldAreaSize) {
							if (diagramArea.width > oldAreaSize.width) {
								diagramArea.width += scope.nodeMargin;
							} else if (oldAreaSize.width - scope.nodeMargin === diagramArea.width) {
								diagramArea.width = oldAreaSize.width;
							}
							if (diagramArea.height > oldAreaSize.height) {
								diagramArea.height += scope.nodeMargin;
							} else if (oldAreaSize.height - scope.nodeMargin === diagramArea.height) {
								diagramArea.height = oldAreaSize.height;
							}
						}
						diagram.oldAreaSize = {
							width: diagramArea.width,
							height: diagramArea.height
						};
						ej.Diagram.SvgContext.setSize(diagram._svg, diagramArea.width, diagramArea.height);
					};
				},

				/**
				 * @inheritdoc Terrasoft.Diagram#getUserHandles
				 * @overridden
				 */
				getUserHandles: function() {
					var userHandles = [];
					userHandles.push(this.mixins.nodeSelectionTool.getNodeSelectionTool.call(this));
					userHandles.push(this.mixins.nodeRemoveTool.getNodeRemoveTool.call(this));
					userHandles.push(this.mixins.nodeAddTool.getNodeAddTool.call(this));
					return userHandles;
				},

				/**
				 * @inheritdoc Terrasoft.Diagram#onRemoveItem
				 * @overridden
				 */
				onRemoveItem: function(item) {
					if (this.isDiagramLoaded()) {
						var node = this.getElementById(item.name);
						if (node) {
							var lookupEdit = node.lookup;
							if (lookupEdit && !lookupEdit.destroyed) {
								lookupEdit.destroy();
								lookupEdit = node.lookup = null;
								var htmlelement = document.getElementById(node.name + "_parentdiv");
								if (htmlelement) {
									htmlelement.parentNode.removeChild(htmlelement);
								}
							}
						}
					}
					this.callParent(arguments);
				},

				/**
				 * @inheritdoc Terrasoft.Diagram#disableKeys
				 * @overridden
				 */
				disableKeys: function() {
					ej.Diagram.prototype._keydown = Ext.emptyFn;
					ej.Diagram.prototype._keyup = Ext.emptyFn;
				},

				/**
				 * @inheritdoc Terrasoft.Diagram#onDestroy
				 * @overridden
				 */
				onDestroy: function() {
					var diagram = this.diagram;
					if (diagram) {
						var tools = diagram.tools;
						for (var tool in tools) {
							if (tools.hasOwnProperty(tool)) {
								var menu = tools[tool].menu;
								if (menu && !menu.destroyed) {
									menu.destroy();
									menu = tools[tool].menu = null;
								}
							}
						}
					}
					this.callParent(arguments);
				},

				/**
				 * Функция формирует ссылку на изображение.
				 * @protected
				 * @param {Guid} imageId Идентификатор изображения.
				 * @return {String} Путь к изображению.
				 */
				getImageSrc: function(imageId) {
					if (!imageId) {
						return null;
					}
					return Terrasoft.ImageUrlBuilder.getUrl({
						source: Terrasoft.ImageSources.SYS_IMAGE,
						params: {
							primaryColumnValue: imageId
						}
					});
				},

				/**
				 * Рисует фильтр для инструмента и возвращает путь к фильтру.
				 * @protected
				 * @param {Object} config Конфиг фильтра.
				 * @param {Object} svg Svg контейнер.
				 * @return {String} Путь к фильтру.
				 */
				renderToolFilter: function(config, svg) {
					if (config.constraints & ej.datavisualization.Diagram.NodeConstraints.Shadow) {
						var defs = svg.getElementsByTagName("defs")[0];
						var width = config.width + 10;
						var height = config.height + 10;
						if (ej.browserInfo().name === "chrome") {
							width = config.width / 3;
							height = config.height / 3;
						}
						var filter = svg.filter({
							id: config.name + "_filter",
							width: width,
							height: height
						});
						var offset = svg.feOffset({
							result: "offOut",
							in: "SourceAlpha",
							dx: "1",
							dy: "1"
						});
						filter.appendChild(offset);
						var matrix = svg.feColorMatrix({
							result: "matrixOut",
							in: "offOut",
							type: "matrix",
							values: "0.2 0 0 0 0 0 0.2 0 0 0 0 0 0.2 0 0 0 0 0 0.3 0"
						});
						filter.appendChild(matrix);
						var blur = svg.feGaussianBlur({
							result: "blurOut",
							in: "matrixOut",
							stdDeviation: "2"
						});
						filter.appendChild(blur);
						var blend = svg.feBlend({
							in: "SourceGraphic",
							in2: "blurOut",
							mode: "normal"
						});
						filter.appendChild(blend);
						defs.appendChild(filter);
						return ("url(#" + config.name + "_filter)");
					}
					return null;
				},

				/**
				 * Рисует пользовательский инструмент.
				 * @protected
				 * @param {Object} handle Инструмент.
				 * @param {Object} node Нода.
				 * @param {Object} svg Svg контейнер.
				 * @param {Object} scale Маштаб.
				 * @param {Object} parent Родитель.
				 * @param {Object} diagram Диаграмма
				 */
				nodeToolRenderUserHandle: function(handle, node, svg, scale, parent, diagram) {
					var x = handle.position.x;
					var y = handle.position.y;
					if (handle.showOnInPort && node.inPort) {
						x = node.inPort.offset.x;
						y = node.inPort.offset.y;
					} else if (handle.showOnOutPort && node.outPort) {
						x = node.outPort.offset.x;
						y = node.outPort.offset.y;
					}
					handle.offsetX = node.offsetX - (node.width / 2) + (node.width * x) - (handle.TOOL_SIZE / 2);
					handle.offsetY = node.offsetY - (node.height / 2) + (node.height * y) - (handle.TOOL_SIZE / 2);
					var g = svg.g({
						id: svg.document.id + "userHandle_g",
						class: "userHandle"
					});
					parent.appendChild(g);
					var imageConf = {
						id: handle.name + "_shape",
						width: handle.TOOL_SIZE,
						height: handle.TOOL_SIZE,
						x: handle.offsetX,
						y: handle.offsetY,
						class: "userHandle " + handle.name,
						preserveAspectRatio: "none",
						filter: diagram.renderToolFilter({
							name: handle.name + "Filter",
							constraints: ej.Diagram.NodeConstraints.Shadow,
							width: handle.TOOL_SIZE,
							height: handle.TOOL_SIZE
						}, svg)
					};
					var image = svg.image(imageConf);
					var imageUrl = diagram.getImageSrc(handle.imageId);
					image.setAttributeNS(handle.XLINK_NAMESPACE, handle.XLINK_ATTRIBUTE, imageUrl);
					g.appendChild(image);
					if (handle.enableContextMenu && diagram.renderToolContextMenu) {
						diagram.renderToolContextMenu(handle, node, svg, scale, parent, diagram);
					}
				},

				/**
				 * Рисует меню инструмента.
				 * @protected
				 * @param {Object} handle Инструмент.
				 */
				renderToolContextMenu: function(handle) {
					var tool = handle.tool;
					var menuCollection = [];
					if (tool.menu) {
						return;
					}
					Terrasoft.each(handle.contextMenu.items, function(menuItem) {
						menuCollection.push(Ext.apply({
							"className": "Terrasoft.MenuItem",
							"click": {
								"bindTo": "menuItemClick"
							}
						}, menuItem));
					});
					var menu = Ext.create("Terrasoft.Menu", {
						items: menuCollection
					});
					menu.bind(tool);
					tool.menu = menu;
				}
			});
		}
);
