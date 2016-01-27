/**
 * Демонстрационный модуль просмотра статей БЗ.
 * Для закрузки статьи необходимо передать id статья через url
 * Например
 * #KnowledgeBaseArticleViewModule/KnowledgeBase/view/CDA67AD8-F65C-4F9D-B357-0E42585F4D12
 */
define('KnowledgeBaseArticleViewModule',
	['ext-base', 'terrasoft', 'sandbox', 'KnowledgeBase', 'KnowledgeBaseHtmlEditModule', 'css!HtmlEditModule'],
	function(Ext, Terrasoft, sandbox, entitySchema) {
		var inputKnowledgeBaseId = null;
		var viewModel = null;
		/**
		 * Генерация ViewModel модуля
		 * @protected
		 * @returns {Terrasoft.BaseViewModel}
		 */
		var getViewModel = function() {
			var notesColumn = entitySchema.columns.Notes;
			var viewModelColumns = {
				Notes: {
					caption: notesColumn.caption,
					columnPath: notesColumn.name,
					name: notesColumn.name,
					type: Terrasoft.ViewModelColumnType.ENTITY_COLUMN
				}
			};
			return Ext.create('Terrasoft.BaseViewModel', {
				entitySchema: entitySchema,
				columns: viewModelColumns,
				methods: {
					/**
					 * Обработчик загрузки контента в редактор
					 * Присваивает гипер-ссылкам обработчик нажатия
					 * @protected
					 */
					afterHtmlEditorDataReady: function() {
						var htmlEdit = Ext.getCmp('email-body-html-knowbase-view');
						if (Ext.isEmpty(htmlEdit)) {
							return;
						}
						var html = htmlEdit.editor.document.$.body;
						var links = html.getElementsByTagName('a');
						if (!links.length) {
							return;
						}
						Terrasoft.each(links, function(link) {
							link.onclick = viewModel.linkClickHandler;
						});
					},
					/**
					 * Обработчик нажатия на гипер-ссылку
					 * @param evn аргументы события
					 * @returns {boolean} - всегда false
					 */
					linkClickHandler : function(evn) {
						var target = evn.target;
						if (Ext.isEmpty(target) || Ext.isEmpty(target.href)) {
							return false;
						}
						viewModel.htmlEditHyperlinkClicked(target.href);
						return false;
					},
					/**
					 * Обработчик нажатия на гипер-ссылку в контенте редактора
					 * @param {String} href Адрес гипер-ссылки
					 */
					htmlEditHyperlinkClicked: function(href) {
						// проверяем на какой ресурс указывает ссылка
						if (Ext.isEmpty(href)) {
							return;
						}
						var linkParts = href.split('KnowledgeBasePage/view/').reverse();
						if (linkParts.length <= 1) {
							return;
						}
						var linkGuid = linkParts[0];
						if (!Terrasoft.utils.isGUID(linkGuid)) {
							return;
						}
						this.loadEntity(linkGuid);
					}
				}
			});
		};

		/**
		 * Генерация View модуля
		 * @protected
		 * @returns {Terrasoft.Container}
		 */
		var generateMainView = function() {
			var resultConfig = Ext.create('Terrasoft.Container', {
				id: 'KnowledgeBaseArticleContainer',
				selectors: {
					wrapEl: '#KnowledgeBaseArticleContainer'
				},
				items: [{
					className: 'Terrasoft.controls.KnowledgeBaseHtmlEdit',
					id: 'email-body-html-knowbase-view',
					selectors: {
						wrapEl: '#email-body-html-knowbase-view'
					},
					enabled: false,
					value: {
						bindTo: 'Notes'
					},
					afterDataReady: {
						bindTo: 'afterHtmlEditorDataReady'
					},
					classes: {
						wrapClassName: ['html-edit-wrapClass']
					}
				}]
			});
			return resultConfig;
		};

		/**
		 * Метод-рендер
		 * @param renderTo - родительский контейнер
		 */
		var render = function(renderTo) {
			var viewConfig = generateMainView();
			viewModel = getViewModel();
			if (!Ext.isEmpty(inputKnowledgeBaseId) && Terrasoft.isGUID(inputKnowledgeBaseId)) {
				viewModel.loadEntity(inputKnowledgeBaseId, function() {
					viewConfig.bind(viewModel);
					viewConfig.render(renderTo);
				}, this);
			} else {
				viewConfig.render(renderTo);
			}
		};

		/**
		 * Инициализация inputKnowledgeBaseId. Считывание входящего id статьи БЗ
		 * @protected
		 */
		var initInputKnowledgeBaseId = function() {
			var state = sandbox.publish('GetHistoryState');
			var currentHash = state.hash;
			inputKnowledgeBaseId = currentHash.recordId;
		};

		return {
			init: function() {
				initInputKnowledgeBaseId();
			},
			render: render
		};
	});