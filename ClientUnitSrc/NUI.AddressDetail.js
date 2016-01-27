define("AddressDetail", ["ext-base", "terrasoft", "sandbox", "ContactAddress", "AccountAddress",
	"AddressDetailStructure", "AddressDetailResources", "LookupUtilities"], function(Ext, Terrasoft, sandbox,
		ContactAddress, AccountAddress, structure, resources, LookupUtilities) {

	var getContainerConfig = function(id, styles) {
		var container = {
			className: "Terrasoft.Container",
			items: [],
			id: id,
			selectors: {
				wrapEl: "#" + id
			}
		};
		if (styles) {
			container.classes = {
				wrapClassName: styles
			};
		}
		return container;
	};

	var getLookupConfig = function(columnName) {
		return {
			className: "Terrasoft.LookupEdit",
			value: {
				bindTo: columnName
			},
			loadVocabulary: {
				bindTo: "loadVocabulary"
			},
			list: {
				bindTo: columnName + "List"
			},
			change: {
				bindTo: "getLookupQuery"
			},
			tag: columnName
		};
	};

	var filterSchemaName;
	var columnsForLookup = {};

	structure.userCode = function() {
		switch (this.filterPath) {
			case "Contact":
				this.entitySchema = ContactAddress;
				filterSchemaName = "Contact";
				break;
			case "Account":
				this.entitySchema = AccountAddress;
				filterSchemaName = "Account";
				break;
		}
		this.name = "AddressDetailViewModel";
		this.parentColumnPath = "Id";
		this.typeColumn = "AddressType";
		this.filterColumnPath = filterSchemaName;
		this.attributes = [
			{
				type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
				name: "AddressType",
				columnPath: "AddressType",
				dataValueType: Terrasoft.DataValueType.ENUM,
				visible: true
			}, {
				type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
				name: "Address",
				columnPath: "Address",
				dataValueType: Terrasoft.DataValueType.TEXT,
				visible: true
			}, {
				type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
				name: "Country",
				columnPath: "Country",
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				visible: true
			}, {
				type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
				name: "Region",
				columnPath: "Region",
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				visible: true
			}, {
				type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
				name: "City",
				columnPath: "City",
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				visible: true
			}, {
				type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
				name: "Zip",
				columnPath: "Zip",
				dataValueType: Terrasoft.DataValueType.TEXT,
				visible: true
			}, {
				type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
				name: filterSchemaName,
				columnPath: filterSchemaName,
				dataValueType: Terrasoft.DataValueType.ENUM,
				visible: false,
				viewVisible: false
			}
		];

		this.methods.filterTypes = function(select) {
			select.filters.add("schemaTypeFilter", Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL, "For" + filterSchemaName, true));
			return "For" + filterSchemaName;
		};
		this.methods.getAddItems = function(collection) {
			return collection;
		};
		this.methods.typeChanged = function(tag) {
			this.set("AddresType", tag);
		};
		this.methods.onLocationIconClick = function(context) {
			var instanceId = context.target.id.substring(0, 36);
			var viewModelItems = this.get("gridData").collection.items;
			var filteredItems = viewModelItems.filter(function(value) {
					return (value.instanceId === instanceId);
				}
			);
			var viewModelItem = filteredItems[0];
			var address = viewModelItem.getConcatenatedAddress();
			var object = viewModelItem.get(filterSchemaName) ?
				viewModelItem.get(filterSchemaName).displayValue : undefined;
			if (address && object) {
				Ext.get(instanceId + "-locationMarker").dom.href =
				"https://maps.google.com?q=" + encodeURIComponent(address);
			}
		};
		this.methods.getConcatenatedAddress = function() {
			var address = this.get("Address");
			var city = this.get("City") ? this.get("City").displayValue : undefined;
			var country = this.get("Country") ? this.get("Country").displayValue : undefined;
			var zip = this.get("Zip");
			var concatenatedAddress = [];
			if (address) {
				concatenatedAddress.push(address);
			}
			if (city) {
				concatenatedAddress.push(city);
			}
			if (country) {
				concatenatedAddress.push(country);
			}
			if (zip) {
				concatenatedAddress.push(zip);
			}
			return concatenatedAddress.join(", ");
		};
		this.methods.init = function() {
			var collection = this.get("gridData");
			Terrasoft.each(collection.getItems(), function(item) {
				this.initItem.call(item);
			}, this);
		};
		this.methods.initItem = function() {
			Terrasoft.each(["Country", "Region", "City"], function(columnName) {
				if (Ext.isEmpty(this.get(columnName))) {
					this.set(columnName, null);
				}
			}, this);
			this.on("change:Country", function() {
				dependClean.call(this, "Country", "Region");
				dependClean.call(this, "Country", "City");
			});
			this.on("change:Region", function() {
				dependSet.call(this, "Country", "Region");
				dependClean.call(this, "Region", "City");
			});
			this.on("change:City", function() {
				dependSet.call(this, "Country", "City");
				dependSet.call(this, "Region", "City");
			});
		};
		this.methods.getCustomItemView = function(viewModel, itemKey, action, types, itemViewModel) {
			Terrasoft.each(types, function(item) {
				item.click = {
					bindTo: "typeChanged"
				};
			});
			var columns = viewModel.attributes;
			var typeColumn = columns[0];
			var addressColumn = columns[1];
			var countryColumn = columns[2];
			var regionColumn = columns[3];
			var cityColumn = columns[4];
			var zipColumn = columns[5];
			var viewConfig = getContainerConfig(itemKey + "-view", "detail-view-container-user-class");
			switch (action) {
				case "add":
				case "copy":
				case "edit":
					var labelConfig = getContainerConfig(itemKey + "-label", "controlCaption edit-detail-type-label");
					var typeButton = {
						id: itemKey + "-type",
						className: "Terrasoft.Button",
						classes: {
							wrapperClass: "detail-type-btn-user-class"
						},
						style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						selectors: {
							wrapEl: "#" + itemKey + "-type"
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
					var deleteButton = {
						id: itemKey + "-delete",
						className: "Terrasoft.Button",
						classes: {
							wrapperClass: "detail-delete-btn-user-class"
						},
						imageConfig: resources.localizableImages.DeleteIcon,
						style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						selectors: {
							wrapEl: "#" + itemKey + "-delete"
						},
						click: {
							bindTo: "delete"
						}
					};
					labelConfig.items.push(typeButton, deleteButton);
					var addressLabel = {
						className: "Terrasoft.Label",
						labelClass: "t-label controlCaption",
						caption: resources.localizableStrings.AddressCaption
					};
					var addressEdit = {
						id: itemKey + "-address-edit",
						className: "Terrasoft.TextEdit",
						classes: {wrapClass: ["controlBaseedit"]},
						value: {bindTo: addressColumn.name}
					};
					var countryLabel = {
						className: "Terrasoft.Label",
						labelClass: "t-label controlCaption",
						caption: resources.localizableStrings.CountryCaption
					};
					var countryEdit = getLookupConfig(countryColumn.name);
					var regionLabel = {
						className: "Terrasoft.Label",
						labelClass: "t-label controlCaption",
						caption: resources.localizableStrings.RegionCaption
					};
					var regionEdit = getLookupConfig(regionColumn.name);
					var cityLabel = {
						className: "Terrasoft.Label",
						labelClass: "t-label controlCaption",
						caption: resources.localizableStrings.CityCaption
					};
					var cityEdit = getLookupConfig(cityColumn.name);
					var zipLabel = {
						className: "Terrasoft.Label",
						labelClass: "t-label controlCaption",
						caption: resources.localizableStrings.ZipCaption
					};
					var zipEdit =
					{
						id: itemKey + "-zip-edit",
						className: "Terrasoft.TextEdit",
						classes: {wrapClass: ["controlBaseedit"]},
						value: {bindTo: zipColumn.name}
					};
					viewConfig.items.push(labelConfig);
					viewConfig.items.push(addressLabel, addressEdit);
					viewConfig.items.push(countryLabel, countryEdit);
					viewConfig.items.push(regionLabel, regionEdit);
					viewConfig.items.push(cityLabel, cityEdit);
					viewConfig.items.push(zipLabel, zipEdit);
					break;
				case "view":
					viewConfig.classes = {
						wrapClassName: "detail-view-container-user-class"
					};
					var typeLabel = {
						className: "Terrasoft.Label",
						labelClass: "t-label addresses-header-lbl-user-class controlCaption",
						caption: {
							bindTo: typeColumn.name,
							bindConfig: {
								converter: Terrasoft.getTypedStringValue
							}
						}
					};
					var valueLabel = {
						className: "Terrasoft.Label",
						labelClass: "t-label addresses-value-lbl-user-class",
						caption: {
							bindTo: "getConcatenatedAddress"
						}
					};
					var onLocationIconClick = this.onLocationIconClick;
					var self = this;
					var name = itemKey + "-loaction-img-control";
					var imageConfig = resources.localizableImages.LocationIcon;
					var imageUrl = Terrasoft.ImageUrlBuilder.getUrl(imageConfig);
					var html = '<a id="' + itemKey + '-locationMarker" target="_blank"' +
					' href="https://maps.google.com?q=' +
					encodeURIComponent(itemViewModel.getConcatenatedAddress()) + '">' +
						'<img id = "' + name + '" class = "addresses-location-btn-user-class" ' +
						'src = "' + imageUrl + '"></a>';
					var locationIcon = {
						id: name,
						className: "Terrasoft.HtmlControl",
						html: html,
						selectors: {
							wrapEl: "#" + name
						},
						onAfterRender: function() {
							Ext.get(name).on("click", onLocationIconClick.bind(self));
						}
					};
					var emptyContainer = getContainerConfig(itemKey + "-empty",
						"detail-empty-user-class");
					viewConfig.items.push(typeLabel);
					viewConfig.items.push(valueLabel);
					viewConfig.items.push(locationIcon);
					viewConfig.items.push(emptyContainer);

					break;
			}
			return viewConfig;
		};
		this.methods.loadVocabulary = function(args, tag) {
			var config = {
				entitySchemaName: this.entitySchema.columns[tag].referenceSchemaName,
				multiSelect: false,
				columnName: tag,
				filters: this.getLookupFilters(tag),
				columns: columnsForLookup,
				searchValue: args.searchValue
			};
			var handler = function(args) {
				var columnName = args.columnName;
				var collection = args.selectedRows.collection;
				if (collection.length > 0) {
					this.set(columnName, collection.items[0]);
				}
			};
			LookupUtilities.Open(sandbox, config, handler, this, null, false, false);
			this.scrollTo = document.body.scrollTop || document.documentElement.scrollTop;
			var self = this;
			sandbox.subscribe("LookupResultSelected", function(args) {
				var columnName = args.columnName;
				var collection = args.selectedRows;
				if (collection.getCount() > 0) {
					self.set(columnName, collection.getItems()[0]);
				}
			});
		};
		this.methods.getLookupFilters = function(columnName) {
			var filters = Ext.create("Terrasoft.FilterGroup");
			var country = this.get("Country");
			var region = this.get("Region");
			switch (columnName) {
				case "City":
					columnsForLookup = ["Country", "Region"];
					if (country && country.value) {
						filters.addItem(Terrasoft.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL, "Country", country.value));
					}
					if (region && region.value) {
						filters.addItem(Terrasoft.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL, "Region", region.value));
					}
					break;
				case "Region":
					columnsForLookup = ["Country"];
					if (country && country.value) {
						filters.addItem(Terrasoft.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL, "Country", country.value));
					}
					break;
				default:
					columnsForLookup = [];
					break;
			}
			return filters;
		};
		this.methods.getLookupQuery = function(filterValue, columnName) {
			var esq = this.callParent(arguments);
			var filters = this.getLookupFilters.call(this, columnName);
			Terrasoft.each(columnsForLookup, function(itemName) {
				esq.addColumn(itemName);
			}, this);
			esq.filters.addItem(filters);
			return esq;
		};
		this.methods.validate = function() {
			var isValid = this.get("Country") || this.get("City") || this.get("Address");
			if (!isValid) {
				this.showInformationDialog(resources.localizableStrings.ValidationFailedMessage, function() {
				}, {
					style: Terrasoft.MessageBoxStyles.BLUE
				});
			}
			return isValid;
		};

		this.loadedColumns = [
			{
				columnPath: "AddressType"
			}, {
				columnPath: "Address"
			}, {
				columnPath: "Country"
			}, {
				columnPath: "Region"
			}, {
				columnPath: "City"
			}, {
				columnPath: "Zip"
			}, {
				columnPath: filterSchemaName
			}
		];

		function dependClean(parentName, childName) {
			var parent = this.get(parentName);
			var child = this.get(childName);
			if (Ext.isEmpty(parent) || Ext.isEmpty(child) || Ext.isEmpty(parent.value)) {
				return;
			}
			var childParent = child[parentName];
			if (!(!Ext.isEmpty(childParent) && childParent.value === parent.value)) {
				this.set(childName, null);
			}
		}
		function dependSet(parentName, childName) {
			var parent = this.get(parentName);
			var child = this.get(childName);
			if (Ext.isEmpty(child)) {
				return;
			}
			var childParent = child[parentName];
			if (Ext.isEmpty(childParent)) {
				return;
			}
			if ((Ext.isEmpty(parent) || parent.value !== childParent.value)) {
				this.set(parentName, childParent);
			}
		}
	};

	return structure;
});
