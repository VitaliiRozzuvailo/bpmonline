define("GridProfileHelper", ["ext-base", "terrasoft", "GridProfileHelperResources", "GridUtilities"],
	function(Ext, Terrasoft, resources, GridUtilities) {
		function getLoadedColumnsWithSortedColumnsInitialization(
			select, columnsSettingsProfile, profileSortedColumns) {
			var loadedColumns = {};
			if (columnsSettingsProfile && columnsSettingsProfile.isTiled !== undefined) {
				var isTiled = columnsSettingsProfile.isTiled;
				var gridsColumnsConfig = isTiled ? columnsSettingsProfile.tiledColumnsConfig :
					columnsSettingsProfile.listedColumnsConfig;
				if (gridsColumnsConfig) {
					var columnsConfig = Ext.decode(gridsColumnsConfig);
					for (var i = 0; i < columnsConfig.length; i++) {
						var row = isTiled ? columnsConfig[i] : columnsConfig;
						for (var j = 0; j < row.length; j++) {
							var cell = row[j];
							var key = cell.key;
							var keysCount = key.length;
							var columnPath = cell.metaPath;
							var columnKey = key[keysCount - 1].name.bindTo;
							columnPath = columnPath || columnKey;
							var columnInstance = GridUtilities.createLoadedColumnInstance(cell, columnPath);
							loadedColumns[columnKey] = columnInstance;
							if (cell.orderDirection && cell.orderDirection !== "") {
								profileSortedColumns[columnKey] = {
									name: columnPath,
									orderDirection: cell.orderDirection,
									orderPosition: cell.orderPosition
								};
							}
						}
						if (!isTiled) {
							break;
						}
					}
					this.set("visibleGridColumns", Ext.clone(loadedColumns));
				}
			}
			var sectionSchemaColumns = this.loadedColumns;
			Terrasoft.each(sectionSchemaColumns, function(sectionSchemaColumn) {
				var addItem = true;
				var columnPath = sectionSchemaColumn.columnPath;
				Terrasoft.each(loadedColumns, function(loadedColumn) {
					if (loadedColumn.columnPath === columnPath) {
						addItem = false;
						return;
					}
				});
				if (addItem) {
					var columnInstance = sectionSchemaColumn;
					if (!(sectionSchemaColumn instanceof Terrasoft.BaseQueryColumn)) {
						columnInstance = GridUtilities.createLoadedColumnInstance(sectionSchemaColumn,
							columnPath);
					}
					loadedColumns[columnPath] = columnInstance;
				}
			});

			this.loadedColumns = loadedColumns;
		}
		function initSelectSorting(
			select, columnsSettingsProfile, profileSortedColumns) {
			var collectionColumns = null;
			if (this.esqConfig && this.esqConfig.sort && this.esqConfig.sort.columns) {
				collectionColumns = this.esqConfig.sort.columns;
			}
			var defaultSortedColumn = {};
			if (!Terrasoft.isEmptyObject(profileSortedColumns)) {
				Terrasoft.each(profileSortedColumns, function(profileSortedColumn, key) {
					var sortedColumn = select.columns.collection.get(key);
					sortedColumn.orderPosition = profileSortedColumn.orderPosition;
					sortedColumn.orderDirection = profileSortedColumn.orderDirection;
				}, this);
				return true;
			} else if (collectionColumns) {
				Terrasoft.each(collectionColumns, function(item) {
					var column;
					if (select.columns.contains(item.name)) {
						column = select.columns.get(item.name);
					} else {
						column = select.addColumn(item.name);
					}
					column.orderPosition = item.orderPosition;
					column.orderDirection = item.orderDirection;
					defaultSortedColumn = column;
					defaultSortedColumn.position = select.columns.indexOf(column) - 1;
				}, this);
				if (defaultSortedColumn.columnPath) {
					var caption = GridUtilities.getColumnCaption(
						this.entitySchema.columns[defaultSortedColumn.columnPath].caption,
						defaultSortedColumn.orderDirection
					);
					this.set("sortColumnIndex", defaultSortedColumn.position);
					this.set("gridSortDirection", defaultSortedColumn.orderDirection);
					this.set(defaultSortedColumn.columnPath + "_SortedColumnCaption", caption);
					defaultSortedColumn = {};
				}
				return true;
			}
			return false;
		}
		function updateSortColumnsCaptions(columnsSettingsProfile) {
			var gridsColumnsConfig = columnsSettingsProfile.isTiled ?
				columnsSettingsProfile.tiledColumnsConfig :
				columnsSettingsProfile.listedColumnsConfig;
			var captionsColumnsConfig = columnsSettingsProfile.captionsConfig;
			if (gridsColumnsConfig) {
				var columnsConfig = Ext.decode(gridsColumnsConfig);
				var captionsConfig = captionsColumnsConfig ? Ext.decode(captionsColumnsConfig) : {};
				Terrasoft.each(columnsConfig, function(item) {
					var row = columnsSettingsProfile.isTiled ? item : columnsConfig;
					for (var j = 0; j < row.length; j++) {
						var cell = row[j];
						var cellKey = cell.key;
						var keysCount = cellKey.length;
						var columnKey = cellKey[keysCount - 1].name.bindTo;
						var caption = columnsSettingsProfile.isTiled ?
							cellKey[keysCount - 1].caption :
							captionsConfig[j].name;
						if (!caption && this.entitySchema && this.entitySchema.columns) {
							var esColumn = this.entitySchema.columns[columnKey];
							caption = esColumn ? esColumn.caption : "";
						}
						caption = GridUtilities.getColumnCaption(
							caption, cell.orderDirection
						);
						if (!Ext.isEmpty(cell.orderDirection)) {
							this.set("sortColumnIndex", j);
							this.set("gridSortDirection", cell.orderDirection);
						}
						this.set(columnKey + "_SortedColumnCaption", caption);
					}
					if (!columnsSettingsProfile.isTiled) {
						return false;
					}
				}, this);
			}
		}
		function getSortColumnByIndex(index, columnsSettingsProfile, loadedColumns) {
			var columnsConfig = columnsSettingsProfile.listedColumnsConfig;
			var column;
			var columnName;
			if (!Ext.isEmpty(columnsConfig)) {
				var columns = Ext.decode(columnsConfig);
				column = columns[index];
				columnName = column.key[0].name.bindTo;
			} else {
				column = loadedColumns[index];
				if (column) {
					columnName = column.columnPath;
				}
			}
			return columnName;
		}
		function changeSorting(config) {
			var tag = config.tag;
			var index = config.index;
			var columnsSettingsProfile = config.columnsSettingsProfile;
			if (Ext.isEmpty(tag)) {
				tag = getSortColumnByIndex(index, columnsSettingsProfile, this.loadedColumns);
			}
			var column = this.entitySchema.columns[tag];
			if (!column) {
				var loadedColumns = this.loadedColumns;
				Terrasoft.each(loadedColumns, function(item, key) {
					if (key === tag) {
						column = item;
						column.name = tag;
					}
				});
			}
			if (columnsSettingsProfile) {
				var gridsColumnsConfig = columnsSettingsProfile.isTiled ?
					columnsSettingsProfile.tiledColumnsConfig :
					columnsSettingsProfile.listedColumnsConfig;
				var captionsColumnsConfig = columnsSettingsProfile.captionsConfig;
				if (gridsColumnsConfig) {
					var columnsConfig = Ext.decode(gridsColumnsConfig);
					var captionsConfig = Ext.decode(captionsColumnsConfig);
					Terrasoft.each(columnsConfig, function(item) {
						var row = columnsSettingsProfile.isTiled ? item :
							columnsConfig;
						for (var j = 0; j < row.length; j++) {
							var cell = row[j];
							var cellKey = cell.key;
							var keysCount = cellKey.length;
							var columnKey = cellKey[keysCount - 1].name.bindTo;
							if (columnKey === column.name) {
								cell.orderDirection = GridUtilities.getColumnSortDirection(
									cell.orderDirection, column.dataValueType
								);
								cell.orderPosition = 1;
								this.set("sortColumnIndex", j);
								this.set("gridSortDirection", cell.orderDirection);
							} else {
								cell.orderDirection = "";
								cell.orderPosition = "";
							}
							var caption = columnsSettingsProfile.isTiled ?
								cellKey[keysCount - 1].caption
								: captionsConfig[j].name;
							if (!caption && this.entitySchema && this.entitySchema.columns) {
								var esColumn = this.entitySchema.columns[columnKey];
								caption = esColumn ? esColumn.caption : "";
							}
							caption = GridUtilities.getColumnCaption(
								caption, cell.orderDirection
							);
							this.set(columnKey + "_SortedColumnCaption", caption);
						}
						if (!columnsSettingsProfile.isTiled) {
							return false;
						}
					}, this);
					gridsColumnsConfig = Ext.encode(columnsConfig);
					if (columnsSettingsProfile.isTiled) {
						columnsSettingsProfile.tiledColumnsConfig = gridsColumnsConfig;
					} else {
						columnsSettingsProfile.listedColumnsConfig = gridsColumnsConfig;
					}
				}
			}
			this.setColumnsProfile(columnsSettingsProfile);
		}

		return {
			getLoadedColumnsWithSortedColumnsInitialization: getLoadedColumnsWithSortedColumnsInitialization,
			initSelectSorting: initSelectSorting,
			updateSortColumnsCaptions: updateSortColumnsCaptions,
			changeSorting: changeSorting
		};
	});