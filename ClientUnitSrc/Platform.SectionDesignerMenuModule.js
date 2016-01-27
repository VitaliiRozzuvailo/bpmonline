define('SectionDesignerMenuModule', ['ext-base', 'terrasoft', 'sandbox', 'SideBarModuleResources', 'ModuleUtils'],
	function(Ext, Terrasoft, sandbox, resources, ModuleUtils) {
		var sideBar;
		var info;

		/**
		 * Функция обработчика изменения активного элемента боковой панели
		 * @private
		 * @param {String} index индекс активного элемента
		 * @param {String} itemTag ключ активного элемента
		 */
		function onItemSelected(index, itemTag) {
			sandbox.publish('PostDesignerStructureSelectedItem', {
				itemKey: itemTag,
				callback: function(changed) {
					if (!changed) {
						setSelectedItem();
					}
				},
				scope: this
			});
		}

		/**
		 * Функция обработчика получения структуры дизайнера
		 * @private
		 * @return {Object} структура дизайнера
		 */
		function getSectionDesignerStructureConfig() {
			var sectionDesignerStructureConfig = sandbox.publish('GetDesignerStructureConfig');
			return sectionDesignerStructureConfig;
		}

		/**
		 * Устанавливает активный элемент боковой панели
		 * @private
		 */
		function setSelectedItem() {
			var itemTag = sandbox.publish('GetSectionDesignerStructureItemKey');
			if (itemTag) {
				var index = 0;
				Terrasoft.each(sideBar.items, function(sideBarItem) {
					if (sideBarItem.tag === itemTag) {
						sideBar.setSelectedItem(index);
						return true;
					}
					index++;
				});
			}
		}

		function init() {
			sandbox.subscribe("RefreshMenuPages", onRefreshMenuPages);
		}

		function onRefreshMenuPages() {
			sideBar.items = getSectionDesignerStructureConfig();
			sideBar.reRender();
		}

		var renderContainer;
		/**
		 * Функция отрисовки модуля
		 * @param {Object} renderTo контейнер для отрисовки модуля
		 */
		function render(renderTo) {
			renderContainer = renderTo;
			sandbox.subscribe('PostSectionMenuConfig', function(args) {
				info = args;
				var config = getSectionDesignerStructureConfig();
				sideBar = Ext.create('Terrasoft.SideBar', {
					renderTo: renderTo,
					items: config
				});
				sideBar.on('itemSelected', onItemSelected);
			}, [sandbox.id]);
			sandbox.publish('GetSectionMenuInfo', sandbox.id);
			setSelectedItem();
		}

		return {
			init: init,
			render: render
		};
	}
);