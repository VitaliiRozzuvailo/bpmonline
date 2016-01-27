define('AnniversaryDetail', ['ext-base', 'terrasoft', 'ContactAnniversary', 'AccountAnniversary',
	'AnniversaryDetailStructure', 'AnniversaryDetailResources'],
	function(Ext, Terrasoft, ContactAnniversary, AccountAnniversary, structure, resources) {
		var getContainerConfig = function(id, styles) {
			var container = {
				className: 'Terrasoft.Container',
				items: [],
				id: id,
				selectors: {
					wrapEl: '#' + id
				}
			};
			if (styles) {
				container.classes = {
					wrapClassName: styles
				};
			}
			return container;
		};
		structure.userCode = function() {
			var filterSchemaName;
			this.selectedItem = {};
			switch (this.filterPath) {
				case 'Contact':
					this.entitySchema = ContactAnniversary;
					filterSchemaName = 'Contact';
					break;
				case 'Account':
					this.entitySchema = AccountAnniversary;
					filterSchemaName = 'Account';
					break;
				default:
					break;
			}
			this.name = 'AnniversaryDetailViewModel';
			this.parentColumnPath = 'Id';
			this.typeColumn = 'AnniversaryType';
			this.filterColumnPath = filterSchemaName;
			this.attributes = [{
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: 'AnniversaryType',
					columnPath: 'AnniversaryType',
					dataValueType: Terrasoft.DataValueType.ENUM,
					visible: false,
					captionVisible: false,
					viewVisible: false
				}, {
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Date',
					columnPath: 'Date',
					dataValueType: Terrasoft.DataValueType.DATE,
					visible: true,
					captionVisible: true,
					caption: {
						bindTo: 'AnniversaryType.Name'
					}
				}, {
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: filterSchemaName,
					columnPath: filterSchemaName,
					dataValueType: Terrasoft.DataValueType.ENUM,
					visible: false,
					viewVisible: false
				}
			];

			this.defValues = [];
			this.methods.typeChanged = function(tag) {
				this.selectedItem = tag;
			};
			
			this.methods.getCustomItemView = function(viewModel, itemKey, action, types) {
				Terrasoft.each(types, function(item) {
					item.click = {
						bindTo: 'typeChanged'
					};
				});
				var columns = viewModel.attributes;
				var typeColumn = columns[0];
				var dateColumn = columns[1];
				var viewConfig = getContainerConfig(itemKey + '-view', 'detail-view-container-user-class');
				switch (action) {
					case 'add':
					case 'copy':
					case 'edit':
						var titleConfig = getContainerConfig(itemKey + '-title', 'controlCaption');
						var valueConfig = getContainerConfig(itemKey + '-value');
						var typeButtonConfig = {
							id: itemKey + '-type',
							className: 'Terrasoft.Button',
							classes: {
								wrapperClass: 'detail-type-btn-user-class',
								innerWrapperClass: 'communication-detail-type-btn-inner-user-class'
							},
							style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							selectors: {
								wrapEl: '#' + itemKey + '-type'
							},
							caption: {
								bindTo: typeColumn.name,
								bindConfig: {
									converter: Terrasoft.getTypedStringValue
								}
							},
							menu: {
								items: types
							}
						};
						var deleteButtonConfig = {
							id: itemKey + '-delete',
							className: 'Terrasoft.Button',
							classes: {
								wrapperClass: 'detail-delete-btn-user-class'
							},
							imageConfig: resources.localizableImages.DeleteIcon,
							style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							selectors: {
								wrapEl: '#' + itemKey + '-delete'
							},
							click: {
								bindTo: 'delete'
							}
						};
						var editConfig = {
							id: itemKey + '-edit',
							className: 'Terrasoft.DateEdit',
							value: {
								bindTo: dateColumn.name
							}
						};
						titleConfig.items.push(typeButtonConfig, deleteButtonConfig);
						valueConfig.items.push(editConfig);
						viewConfig.items.push(titleConfig, valueConfig);
						break;
					case 'view':
						var typeLabel = {
							className: 'Terrasoft.Label',
							labelClass: 't-label communication-detail-type-lbl-user-class',
							caption: {
								bindTo: typeColumn.name,
								bindConfig: {
									converter: Terrasoft.getTypedStringValue
								}
							},
							visible: {
								bindTo: typeColumn.name,
								bindConfig: {
									converter: function(value) {
										return Ext.isEmpty(value) ? false : true;
									}
								}
							}
						};
						var dateLabel = {
							className: 'Terrasoft.Label',
							labelClass: 't-label communication-detail-number-lbl-user-class',
							caption: {
								bindTo: dateColumn.name,
								bindConfig: {
									converter: Terrasoft.getTypedStringValue
								}
							},
							visible: {
								bindTo: typeColumn.name,
								bindConfig: {
									converter: function(value) {
										return Ext.isEmpty(value) ? false : true;
									}
								}
							}
						};
						var emptyContainer = getContainerConfig(itemKey + '-empty',
								'detail-empty-user-class');
						emptyContainer.visible = {
							bindTo: typeColumn.name,
							bindConfig: {
								converter: function(value) {
									return Ext.isEmpty(value) ? false : true;
								}
							}
						};
						viewConfig.items.push(typeLabel, dateLabel, emptyContainer);
						break;
				}
				return viewConfig;
			};
			
			this.methods.getAddItems = function(collection) {
				return collection;
			};
			this.methods.onLookUpClick = function() {
				return;
			};
			this.methods.save = function() {
				
			};
			this.loadedColumns = [
				{
					columnPath: 'Date'
				}, {
					columnPath: 'AnniversaryType'
				}, {
					columnPath: filterSchemaName
				}
			];
		};

		return structure;
	});