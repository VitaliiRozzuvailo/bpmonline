define('SideBarModule', ['ext-base', 'terrasoft', 'sandbox', 'SideBarModuleResources'],
	function(Ext, Terrasoft, sandbox, resources) {
		var nodes = [];
		var leftPanelHeader;
		var leftPanelContent;

		var render = function(renderTo) {
			renderView(renderTo);
			sandbox.subscribe('SideBarLoadModule', onSideBarLoadModule);
			sandbox.subscribe('SideBarBack', onSideBarBack);
			sandbox.subscribe('GetSideBarCurrentConfig', getSideBarCurrentConfig);
			sandbox.subscribe('PushSideBarModuleDefInfo', function(menuItems) {
				nodes.push(menuItems);
				updateHistoryNodes();
				renderNode(menuItems);
			});

			var historyState = sandbox.publish('GetHistoryState');
			if (historyState && historyState.state) {
				var historyNodes = historyState.state.SideBarNodes;
				if (Ext.isArray(historyNodes) && historyNodes.length > 0) {
					nodes = [].concat(historyNodes);
				}
			}
			if (nodes.length > 0) {
				renderNode(nodes[nodes.length - 1]);
			} else {
				sandbox.publish('SideBarModuleDefInfo');
			}
		};

		function updateHistoryNodes() {
			var historyState = sandbox.publish('GetHistoryState');
			var state = historyState.state || {};
			state.SideBarNodes = nodes;
			if (historyState.hash) {
				sandbox.publish('ReplaceHistoryState', {
					stateObj: state,
					hash: historyState.hash.historyState,
					silent: true
				});
			}
		}

		function getSideBarCurrentConfig() {
			return getCurrentNode();
		}

		function onSideBarBack() {
			if (nodes.length > 1) {
				clearRenderedItems();
				nodes.pop();
				renderNode(getCurrentNode());
			}
		}

		function onSideBarLoadModule(args) {
			var newNode = args.items;
	   		if (newNode) {
				clearRenderedItems();
			   	/*if (args.keepAlive === false) {
					nodes.pop();
				}*/
				nodes.pop();
				nodes.push(newNode);
				renderNode(newNode);
			} else {
				var currentNode = getCurrentNode();
				if (!Ext.isEmpty(args.position)) {
					currentNode.splice(args.position, 0, args);
					renderItem(args, args.position);
				} else {
					renderItem(args);
				}
			}
			updateHistoryNodes();
		}

		function getCurrentNode() {
			return nodes[nodes.length - 1];
		}

		function clearRenderedItems() {
			var currentNode = getCurrentNode();
			Terrasoft.each(currentNode, function(item) {
				sandbox.unloadModule(item.id);
				var renderToContainer = Ext.get(item.id);
				renderToContainer.destroy();
			}, this);
			leftPanelHeader.reRender();
			leftPanelContent.reRender();
		}

		function renderNode(node) {
			Terrasoft.each(node, function(item) {
				renderItem(item);
			}, this);
		}

		function renderView(renderTo) {
			leftPanelHeader = Ext.create("Terrasoft.Container", {
				renderTo: renderTo,
				id: 'leftPanelHeader',
				classes: {
					wrapClassName: ['header']
				},
				selectors: {
					wrapEl: '#leftPanelHeader'
				}
			});
			leftPanelContent = Ext.create("Terrasoft.Container", {
				renderTo: renderTo,
				id: 'leftPanelContent',
				classes: {
					wrapClassName: ['scroll', 'content']
				},
				selectors: {
					el: '#leftPanelContent',
					wrapEl: '#leftPanelContent'
				}
			});
		}

		function renderItem(item, position) {
			var id = item.id = item.id || 'item' + Terrasoft.generateGUID();
			var renderTo = (item.showInHeader) ? leftPanelHeader.getWrapEl() : leftPanelContent.getWrapEl();
			var itemContainer = Ext.create("Terrasoft.Container", {
				renderTo: renderTo,
				id: id,
				selectors: {
					el: '#' + id,
					wrapEl: '#' + id
				}
			});
			if (!Ext.isEmpty(position)) {
				itemContainer.reRender(position);
			}
			sandbox.loadModule(item.name, {
				renderTo: id,
				id: id
			});
		}

		function init() {
			sandbox.subscribe('GetSectionMenuInfo', function(menuId) {
				Terrasoft.each(getCurrentNode(), function(item) {
					if (item.id === menuId) {
						sandbox.publish('PostSectionMenuConfig', Terrasoft.deepClone(item.config || {}), [menuId]);
					}
				}, this);
			});
		}

		return {
			init: init,
			render: render
		};
	});