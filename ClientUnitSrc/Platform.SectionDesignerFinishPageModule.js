define('SectionDesignerFinishPageModule', ['ext-base', 'terrasoft', 'sandbox',
		'SectionDesignerFinishPageModuleResources', 'SectionDesignerUtils', 'SectionDesignDataModule',
		'SectionDesignerEnums', 'ModalBox'],
	function(Ext, Terrasoft, sandbox, resources, SectionDesignerUtils, SectionDesignDataModule, SectionDesignerEnums, ModalBox) {
		var view,
			viewModel;

		/**
		 * Локализированные строки ресурсов
		 * @private
		 * @type {Object}
		 */
		var localizableStrings = resources.localizableStrings;

		/**
		 * Инициирует переход к определенному шагу
		 * @private
		 * @param {StepType} step
		 */
		function GoToStep(step) {
			sandbox.publish('GoToStep', {
				stepCompleteResult: step,
				sandboxId: sandbox.id
			});
		}

		/**
		 * Функция создания модели представления
		 * @private
		 */
		function getViewModel() {
			var config = {
				columns: {},
				values: {
				header: localizableStrings.PageCaption
				},
				methods: {
					onPreviousButtonClick: function() {
						GoToStep(SectionDesignerEnums.StepType.PREV);
					},
					onNextButtonClick: function() {
						GoToStep(SectionDesignerEnums.StepType.NEXT);
					},
					onCancelButtonClick: function() {
						GoToStep(SectionDesignerEnums.StepType.EXIT);
					},
					onApplyButtonClick: function() {
						SectionDesignDataModule.save();
					},
					onSaveButtonClick: function() {
						SectionDesignDataModule.save();
					}
				}
			};
			var viewModel = Ext.create('Terrasoft.BaseViewModel', config);
			return viewModel;
		}

		/**
		 * Функция создания представления
		 * @private
		 */
		function getView() {
			var headerConfig = SectionDesignerUtils.getModuleHeaderConfig(["Previous", "Save", "Cancel"]);
			var config = {
				id: 'sectionDesignerFinishPage',
				selectors: {
					wrapEl: '#sectionDesignerFinishPage'
				},
				items: [
					headerConfig,
					{
						className: 'Terrasoft.Container',
						id: 'sectionDesignerFinishPageContainer',
						selectors: {
							wrapEl: '#sectionDesignerFinishPageContainer'
						},
						classes: {
							wrapClassName: ['grid-settings-main-container']
						}
					}
				]
			};
			var view = Ext.create('Terrasoft.Container', config);
			return view;
		}

		/**
		 * Функция отрисовки модуля
		 * @param {Ext.Element} renderTo контейнер для отрисовки модуля
		 */
		var render = function(renderTo) {
			if (Ext.isEmpty(viewModel)) {
				viewModel = getViewModel();
			}
			view = getView();
			view.bind(viewModel);
			view.render(renderTo);
		};

		/**
		 * Функция инициализации модуля
		 */
		var init = function() {

		};

		return {
			render: render,
			init: init
		};
	}
);