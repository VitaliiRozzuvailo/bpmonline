define('EditPageDesignerHelper', ['ext-base', 'terrasoft', 'ConfigurationEnumsResources', 'StorageUtilities'],
	function(Ext, Terrasoft, resources, storageUtilities) {
		var mainContainersIds = ['customPanel', 'leftPanel', 'rightPanel'];
		function updateSchema(schema, modificationList) {
			Terrasoft.each(modificationList.getItems ?
				modificationList.getItems() :
				modificationList,
				function(modification) {
					applyModification(schema.schema, modification);
				}
			);
		}
		function findElementIndexByName(container, name, containerId) {
			var  visibleIndex = 0;
			for (var i = 0; i < container.length; i++) {
				if ((!Ext.isEmpty(containerId) && containerId === container[i].EditStructureContainerId) ||
					(Ext.isEmpty(containerId) && container[i].name === name)) {
					return {
						index: i,
						visibleIndex: visibleIndex
					};
				}
				if (container[i].visible !== false) {
					visibleIndex++;
				}
			}
			return -1;
		}
		function findElementIndexByNameRecursive(container, name, containerId, skipVisibleValue) {
			var result = findElementIndexByName(container, name, containerId);
			if (result !== -1) {
				return {
					container: container,
					index: result.index,
					visibleIndex: result.visibleIndex,
					ContainerPath: []
				};
			}
			for (var i = 0; i < container.length; i++) {
				if (container[i].hasOwnProperty('items') && container[i].items) {
					if (container[i].visible === false && !skipVisibleValue) {
						continue;
					}
					result = findElementIndexByNameRecursive(container[i].items, name, containerId, skipVisibleValue);
					if (!Ext.isEmpty(result)) {
						result.ContainerPath.unshift(container[i]);
						return result;
					}
				}
			}
			return null;
		}
		function changeElementPosition(oldContainer, newContainer, oldIndex, newIndex) {
			newContainer.splice(newIndex, 0, oldContainer.splice(oldIndex, 1)[0]);
		}
		function moveElement(schema, name, position, newContainerName, containerId, contContainerId) {
			for (var i = 0; i < mainContainersIds.length; i++) {
				var containerName = mainContainersIds[i];
				if (!schema.hasOwnProperty(containerName)) {
					continue;
				}
				var result = findElementIndexByNameRecursive(schema[containerName], name, containerId);
				if (!Ext.isEmpty(result)) {
					result.ContainerPath.unshift({
						name: containerName,
						items: schema[containerName]
					});
					var newContainer = result.container;
					if (result.ContainerPath[result.ContainerPath.length - 1].name !== newContainerName) {
						var mainContainerIndex = mainContainersIds.indexOf(newContainerName);
						if (mainContainerIndex !== -1) {
							newContainer = schema[mainContainersIds[mainContainerIndex]];
						} else {
							var container = findElementIndexByNameRecursive(schema[containerName],
								newContainerName,
								contContainerId);
							if (!Ext.isEmpty(container)) {
								newContainer = container.container[container.index].items;
							}
						}
					}
					if ((newContainer !== null) && (newContainer !== undefined)) {
						changeElementPosition(result.container, newContainer, result.index, position);
					}
				}
			}
		}
		function hideElement(schema, name, containerId) {
			for (var i = 0; i < mainContainersIds.length; i++) {
				var containerName = mainContainersIds[i];
				if (!schema.hasOwnProperty(containerName)) {
					continue;
				}
				var result = findElementIndexByNameRecursive(schema[containerName], name, containerId);
				if (!Ext.isEmpty(result)) {
					var element = result.container[result.index];
					hideAllChilds(element);
				}
			}
		}
		function hideAllChilds(element) {
			element.visible = false;
			element.viewVisible = false;
			if (element.hasOwnProperty('items') && element.items) {
				var childs = element.items
				for (var i = 0; i < childs.length; i++) {
					hideAllChilds(childs[i]);
				}
			}
		}
		function deleteElement(schema, name) {
			for (var i = 0; i < mainContainersIds.length; i++) {
				var containerName = mainContainersIds[i];
				if (!schema.hasOwnProperty(containerName)) {
					continue;
				}
				var result = findElementIndexByNameRecursive(schema[containerName], name);
				if (!Ext.isEmpty(result)) {
					result.container.splice(result.index, 1);
				}
			}
		}
		function addElement(schema, value, position, containerName) {
			var container = schema[containerName];
			for (var i = 0; i < mainContainersIds.length; i++) {
				var containerName = mainContainersIds[i];
				if (!schema.hasOwnProperty(containerName)) {
					continue;
				}
				var result = findElementIndexByNameRecursive(schema[containerName], value.name, null,true);
				if (!Ext.isEmpty(result)) {
					var element = result.container[result.index];
					element.visible = true;
					element.viewVisible = true;
					showPath(result.ContainerPath);
					return;
				}
			}
			container.splice(position, 0, value);
		}
		function showPath(path) {
			for (var i = 0; i < path.length; i++) {
				path[i].visible = true;
				path[i].viewVisible = true;
			}
		}
		function modifyElement(schema, value, name, containerId) {
			for (var i = 0; i < mainContainersIds.length; i++) {
				var containerName = mainContainersIds[i];
				if (!schema.hasOwnProperty(containerName)) {
					continue;
				}
				var result = findElementIndexByNameRecursive(schema[containerName], name, containerId);
				if (!Ext.isEmpty(result)) {
					var element = result.container[result.index];
					/*if (value.hasOwnProperty('name')) {
					 delete value.name;
					 }*/
					Ext.apply(element, value);
				}
			}
		}
		function applyModification(schema, modification) {

			switch (modification.type) {
				case 'add':
					addElement(schema, Terrasoft.deepClone(modification.value), modification.position, modification.containerName);
					break;
				case 'move':
					moveElement(schema, modification.name, modification.position,
						modification.containerName, modification.containerId, modification.contContainerId);
					break;
				case 'hide':
					hideElement(schema, modification.name, modification.containerId);
					break;
				case 'delete':
					deleteElement(schema, modification.name, modification.containerId);
					break;
				case 'modify':
					modifyElement(schema, modification.value, modification.name, modification.containerId);
					break;
			}
		}
		function prepareCollectionForLoading(collection) {
			var result = {};
			Terrasoft.each(collection, function(item) {
				var id = Terrasoft.utils.generateGUID();
				result[id] = item;
			});
			return result;
		}

		var EditPageModifications = {};
		function getModifications(editPageName, callback, scope) {
			if (EditPageModifications[editPageName]) {
				var cacheList = new Terrasoft.Collection();
				var items = Terrasoft.deepClone(EditPageModifications[editPageName]);
				cacheList.loadAll(prepareCollectionForLoading(items));
				callback.call(scope || this, cacheList);
				return;
			}
			var select = Ext.create('Terrasoft.EntitySchemaQuery', {
				rootSchemaName: 'EditPageModification'
			});
			select.addColumn('SerializedData');
			select.filters.add('filterModifications', Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL, 'EditPageName', editPageName));
			var innerCallback = function(response) {
				var list = new Terrasoft.Collection();
				if (response.success && response.collection.getCount()) {
					var item = response.collection.getByIndex(0);
					var modifications = Ext.JSON.decode(item.get('SerializedData'));
					if (!Ext.isEmpty(modifications)) {
						var items = Terrasoft.deepClone(modifications);
						list.loadAll(prepareCollectionForLoading(items));
					}
				}
				EditPageModifications[editPageName] = modifications;
				callback.call(scope || this, list);
			};
			var storageQueryConfig = {
				esq: select,
				key: "EditPageModification_" + editPageName,
				callback: innerCallback,
				scope: scope || this
			};
			storageUtilities.GetESQResultByKey(storageQueryConfig);
		}
		function findElementInStructure(elementName) {
			for (var i = 0; i < mainContainersIds.length; i++) {
				var containerName = mainContainersIds[i];
				if (!this.schema.hasOwnProperty(containerName)) {
					continue;
				}
				var findResult = findElementIndexByNameRecursive(this.schema[containerName], elementName, null,true);
				if (!Ext.isEmpty(findResult)) {
					return findResult.container[findResult.index];
				}
			}
			return {};
		}
		function clearCache(name) {
			if (name) {
				if (EditPageModifications[name]) {
					delete EditPageModifications[name];
				}
			} else {
				EditPageModifications = {};
			}
		}
		return {
			updateSchema: updateSchema,
			findElementIndexByNameRecursive: findElementIndexByNameRecursive,
			findElementInStructure: findElementInStructure,
			getModifications: getModifications,
			clearCache: clearCache
		};
	});