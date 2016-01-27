define ("ImageList", ["ModalBox", "ImageListResources", "ImageView", "css!ImageList"], function(modalBox, resources) {
	/**
	 * @class Terrasoft.controls.ImageView
	 * Класс элемента управления для отображения картинок.
	 */
	Ext.define("Terrasoft.controls.ImageList", {

		extend: "Terrasoft.ImageView",

		alternateClassName: "Terrasoft.ImageList",

		modalBox: modalBox,

		imageInRow: 3,

		value: null,

		list: null,

		caption: null,

		wrapClasses: ["image-list"],

		useCachedValue: true,

		initialized: false,

		listPrepareEventName: "prepareList",

		schemaName: null,

		schemaColumn: null,

		imageSrc: Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.DefaultIcon),

		/**
		 * Инициализация компонента меню
		 * @protected
		 * @override
		 */
		init: function() {
			this.callParent(arguments);
			this.addEvents(
				/**
				 * @event
				 * Событие нажатия на элемент отображения картинок.
				 * @param {Terrasoft.ImageView} this
				 */
				"change",
				"prepareList"
			);
		},

		/**
		 * Инициализирует события DOM
		 * @protected
		 * @overridden
		 */
		onClick: function() {
			this.callParent(arguments);
			this.initialized = true;
			if (this.list && this.useCachedValue && this.list.getCount() > 0) {
				this.showList();
			} else {
				this.fireEvent(this.listPrepareEventName, null, this.list);
			}
		},

		getImageSrc: function(item) {
			if (!item) {
				return  Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.DefaultIcon);
			}
			var sysImageId = item.primaryImageValue;
			if (sysImageId &&  item.primaryImageValue.value) {
				sysImageId = item.primaryImageValue.value;
			}
			if (Ext.isEmpty(sysImageId)) {
				return  Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.DefaultIcon);
			}
			return Terrasoft.ImageUrlBuilder.getUrl({
				source: Terrasoft.ImageSources.SYS_IMAGE,
				params: {
					primaryColumnValue: sysImageId
				}
			});
		},

		getItemView: function(item) {
			var config = {
				className: "Terrasoft.Container",
				id: "item_container_" + item.value,
				selectors: {
					wrapEl: "#item_container_" + item.value
				},
				classes: {
					wrapClassName: ["image-list-item-container"]
				},
				items: [
					{
						className: "Terrasoft.ImageView",
						imageSrc: this.getImageSrc(item),
						wrapClasses: ["image-list-image-preview"],
						tag: item.value
					},
					{
						className: "Terrasoft.Label",
						caption: item.displayValue,
						classes: {
							labelClass: ["image-list-item-caption"]
						},
						tag: item.value
					}
				]
			};
			var itemView = Ext.create("Terrasoft.Container", config);
			itemView.items.items[0].on("click", this.onItemClick, this);
			itemView.items.items[1].on("click", this.onItemClick, this)
			return itemView;
		},

		onItemClick: function(sender) {
			var value = sender.tag;
			var selectedItem = null;
			this.list.each(function(item) {
				if (item.value == value) {
					selectedItem = item;
					return;
				}
			}, this);
			this.setValue(selectedItem);
			this.modalBox.close();
		},

		setCaption: function(value) {
			this.caption = value;
		},

		setValue: function(value) {
			if (this.value == value) {
				return;
			}
			this.value = value;
			this.setImageSrc(this.getImageSrc(this.value));
			this.fireEvent("change", value);
		},

		getModalBoxView: function() {
			var closeButton = Ext.create("Terrasoft.Button", {
				imageConfig: resources.localizableImages.CloseIcon,
				classes: {
					wrapperClass: "image-list-close-button"
				},
				style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT
			});
			closeButton.on("click", this.closeList, this);
			var content = Ext.create("Terrasoft.Container", {
				id: "ImageListContentcontainer",
				selectors: {
					wrapEl: "#ImageListContentcontainer"
				},
				items: []
			});
			var headerContainer = Ext.create("Terrasoft.Container", {
				id: "listViewHeaderContainer",
				selectors: {
					wrapEl: "#listViewHeaderContainer"
				},
				classes: {
					wrapClassName: ["image-list-header-container"]
				},
				items: [
					{
						className: "Terrasoft.Label",
						caption: this.caption,
						classes: {
							labelClass: ["image-list-header-caption-label"]
						}
					}
				]
			});
			headerContainer.add(closeButton);
			content.add(headerContainer);
			var rowIndex = 0;
			var itemsContainer = null;
			var currentRow = 0;
			var items = [];
			var columns = [];
			for (var i=0; i<this.imageInRow; i++){
				var columnContainer = Ext.create("Terrasoft.Container", {
					id: "row" + i,
					classes: {
						wrapClassName: ["image-list-column-container"]
					},
					selectors: {
						wrapEl: "#row" + i
					},
					items: []
				});
				columns.push(columnContainer)
			}
			this.list.each(function(item) {
				var itemView = this.getItemView(item, rowIndex, currentRow);
				columns[rowIndex].add(itemView);
				rowIndex++;
				if (rowIndex == this.imageInRow) {
					currentRow++;
					rowIndex=0;
					//content.add(itemsContainer);
				}
			}, this);
			Terrasoft.each(columns, function(column) {
				content.add(column);
			})
			return content;
		},

		closeList: function() {
			this.modalBox.close();
		},

		showList: function() {
			var container = this.modalBox.show({
				widthPixels: "100px",
				heightPixels: "100px"
			});
			var view = this.getModalBoxView();
			view.on("afterrender", this.setModalBoxSize, this)
			view.render(container);
		},

		setModalBoxSize: function() {
			var container = Ext.get("ImageListContentcontainer");
			if (container) {
				var width = container.getWidth();
				var height = container.getHeight();
				this.modalBox.setSize(width + 13, height + 18);
			}
		},

		loadList: function(list) {
			this.list = list;
			if (this.initialized) {
				this.showList();
			}
		},

		subscribeForEvents: function(binding, property, model) {
			this.callParent(arguments);
			var bindings = this.bindings;
			if (!bindings[this.listPrepareEventName]) {
				var lookupColumnName = bindings.value.modelItem;
				var lookupColumn = model.columns[lookupColumnName];
				var isLookup = (this.alternateClassName === 'Terrasoft.LookupEdit') ? true : false;
				if (lookupColumn && lookupColumn.isLookup) {
					var modelMethodName = model.defLoadLookupDataMethod;
					var modelMethod = model[modelMethodName];
					var params = [
						lookupColumnName,
						isLookup
					];
					this.subscribeForControlEvent(this.listPrepareEventName, modelMethod, model, params);
				}
			}
		},

		getBindConfig: function() {
			var parentBindConfig = this.callParent(arguments);
			var bindConfig = {
				value: {
					changeMethod: "setValue",
					changeEvent: "change"
				},
				caption: {
					changeMethod: "setCaption"
				},
				list: {
					changeMethod: "loadList"
				}
			};
			Ext.apply(bindConfig, parentBindConfig);
			return bindConfig;
		}

	});

	return Terrasoft.controls.ImageList;
});
