define("MultiCurrencyEdit", ["terrasoft", "MultiCurrencyEditResources", "css!MultiCurrencyEdit"],
	function(Terrasoft, resources) {
		/**
		 * @class Terrasoft.controls.MultiCurrencyEdit
		 * Класс, реализующий мультивалютный элемент управления.
		 */
		Ext.define("Terrasoft.controls.MultiCurrencyEdit", {
			extend: "Terrasoft.FloatEdit",
			alternateClassName: "Terrasoft.MultiCurrencyEdit",

			mixins: {
				/**
				 * Миксин правой иконки.
				 */
				rightIcon: "Terrasoft.RightIcon",

				/**
				 * Миксин выпадающего контейнера.
				 */
				expandable: "Terrasoft.Expandable"
			},

			//region Fields: Private

			/**
			 * @inheritdoc Terrasoft.BaseEdit#disabledClass
			 * @overridden
			 */
			disabledClass: "multi-currency-edit-disabled",

			/**
			 * Ссылка на элемент-обертку компонента вещественного поля.
			 * @private
			 * @type {Ext.Element}
			 */
			editWrapEl: null,

			/**
			 * Ссылка на элемент-обертку элемента управления валютами.
			 * @private
			 * @type {Ext.Element}
			 */
			currencyButtonWrapEl: null,

			/**
			 * Заголовок.
			 * @private
			 * @type {String}
			 */
			caption: "",

			/**
			 * Ссылка на элемент управления валютами.
			 * @private
			 * @type {Terrasoft.Button}
			 */
			currencyButton: null,

			/**
			 * Ссылка на элемент отображения подписи суммы в базовой валюте в выпадающем контейнере.
			 * @private
			 * @type {Terrasoft.Label}
			 */
			primaryAmountLabel: null,

			/**
			 * Ссылка на элемент управления суммой в базовой валюте в выпадающем контейнере.
			 * @private
			 * @type {Terrasoft.FloatEdit}
			 */
			primaryAmountEdit: null,

			/**
			 * Ссылка на элемент управления валютой в выпадающем контейнере.
			 * @private
			 * @type {Terrasoft.ComboBoxEdit}
			 */
			currencyEdit: null,

			/**
			 * Ссылка на элемент управления курсом в выпадающем контейнере.
			 * @private
			 * @type {Terrasoft.FloatEdit}
			 */
			rateEdit: null,

			/**
			 * Ссылка на элемент отображения дополнительной информации о курсе в выпадающем контейнере.
			 * @private
			 * @type {Terrasoft.Label}
			 */
			rateCurrencyInfoLabel: null,

			/**
			 * Ссылка на элемент управления применения изменений значений в выпадающем контейнере.
			 * @private
			 * @type {Terrasoft.Button}
			 */
			applyButton: null,

			/**
			 * Ссылка на элемент управления отмены изменений значений в выпадающем контейнере.
			 * @private
			 * @type {Terrasoft.Button}
			 */
			cancelButton: null,

			//endregion

			//region Fields: Protected

			/**
			 * Хранит начальное значение свойств value, primaryAmount, currency, rate.
			 * @protected
			 * @type {Object}
			 */
			initValues: null,

			/**
			 * @inheritdoc Terrasoft.RightIcon#enableRightIcon
			 * @overridden
			 */
			enableRightIcon: false,

			/**
			 * @inheritdoc Terrasoft.Expandable#useAutoWidth
			 * @overridden
			 */
			useAutoWidth: true,

			/**
			 * Шаблон элемента управления.
			 * @protected
			 * @type {String[]}
			 */
			containerTpl: [
				/* jshint quotmark: false */
				'<div id="{id}-multiCurrencyWrap" class="{controlWrapClass}">',
				'<div id="{id}-currencyButtonWrap" class="{currencyButtonWrapClass}">',
				'</div>',
				'{edit_placeholder}',
				'</div>'
				/* jshint quotmark: true */
			],

			//endregion

			//region Fields: Public

			/**
			 * Сумма в базовой валюте.
			 * @type {Number}
			 */
			primaryAmount: 0,

			/**
			 * @property {Object} currency Объект с информацией о валюте.
			 * @property {String} currency.value Уникальный идентификатор записи.
			 * @property {String} currency.displayValue Отображаемое значение.
			 * @property {String} currency.ShortName Сокращенное название.
			 * @property {String} currency.Symbol Символ валюты.
			 * @property {Number} currency.Rate Курс валюты.
			 * @property {Number} currency.Division Кратность валюты.
			 * @type {Object}
			 */
			currency: null,

			/**
			 * Базовая валюта.
			 * @type {Object}
			 */
			primaryCurrency: null,

			/**
			 * Список валют и курсов.
			 * @type {Terrasoft.Collection}
			 */
			currencyRateList: null,

			/**
			 * Курс.
			 * @type {Number}
			 */
			rate: 0,

			/**
			 * Признак указывает на то что элемент управления суммой в базовой валюте выпадающего контейнера включен.
			 * @type {Boolean}
			 */
			primaryAmountEnabled: true,

			/**
			 * Признак указывает на то что элемент управления валютой в выпадающем контейнере включен.
			 * @type {Boolean}
			 */
			currencyEnabled: true,

			/**
			 * Признак указывает на то что элемент управления курсом в выпадающем контейнере включен.
			 * @type {Boolean}
			 */
			rateEnabled: true,

			//endregion

			//region Methods: Protected

			/**
			 * Инцициализация сообщений.
			 * @protected
			 */
			initEvents: function() {
				this.on("show", this.onShowContainer, this);
				this.on("hide", this.onHideContainer, this);
				this.addEvents(
					/**
					 * Сообщение изменения суммы в базовой валюте.
					 * @event
					 */
					"primaryAmountChange",

					/**
					 * Сообщение изменения валюты.
					 * @event
					 */
					"currencyChange",

					/**
					 * Сообщение изменения курса.
					 * @event
					 */
					"rateChange"
				);
			},

			/**
			 * @inheritdoc Terrasoft.RightIcon#onRightIconClick
			 * @overridden
			 */
			onRightIconClick: function() {
				if (!this.rendered) {
					return;
				}
				this.fireEvent("rightIconClick", this);
			},

			/**
			 * Инициализация правой иконки элемента управления.
			 * @protected
			 */
			initRightIcon: function() {
				this.rightIconConfig = {
					"source": Terrasoft.ImageSources.URL,
					"url": Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.EditIcon)
				};
			},

			/**
			 * @inheritdoc Terrasoft.Component#initDomEvents
			 * @overridden
			 */
			initDomEvents: function() {
				this.callParent(arguments);
				this.on("rightIconClick", this.onMarkerWrapClick, this);
			},

			/**
			 * @inheritdoc Terrasoft.Component#clearDomListeners
			 * @overridden
			 */
			clearDomListeners: function() {
				this.callParent(arguments);
				this.un("rightIconClick", this.onMarkerWrapClick, this);
				var doc = Ext.getDoc();
				doc.un("mousedown", this.onMouseDownCollapse, this);
			},

			/**
			 * @inheritdoc Terrasoft.Component#getTpl
			 * @overriden
			 */
			getTpl: function() {
				var tpl = this.callParent(arguments);
				//TODO: #CC-827 Реализовать сборку шаблона для мультивалютного контрола на основе Ext.Template
				tpl = this.containerTpl.join("").replace("{edit_placeholder}", tpl.join(""));
				return [tpl];
			},

			/**
			 * @inheritdoc Terrasoft.Component#getTplData
			 * @overriden
			 */
			getTplData: function() {
				var tplData = this.callParent(arguments);
				Ext.apply(tplData, this.combineCurrencyButtonClasses(), {});
				return tplData;
			},

			/**
			 * @inheritdoc Terrasoft.BaseEdit#combineSelectors
			 * @overriden
			 */
			combineSelectors: function() {
				var selectors = this.callParent(arguments);
				selectors = Ext.apply(selectors, {
					wrapEl: "#" + this.id + "-multiCurrencyWrap",
					editWrapEl: "#" + this.id + "-wrap",
					currencyButtonWrapEl: "#" + this.id + "-currencyButtonWrap"
				});
				return selectors;
			},

			/**
			 * Вычисляет стили для элемента управления валютами на основании конфигурации.
			 * @protected
			 * @return {Object} Объект, содержащий CSS классы.
			 */
			combineCurrencyButtonClasses: function() {
				var currencyButtonWrapClass = {
					currencyButtonWrapClass: ["multi-currency-button-wrap"]
				};
				var classes = this.classes || {};
				if (!Ext.isEmpty(classes.currencyButtonWrapClass)) {
					currencyButtonWrapClass.currencyButtonWrapClass =
						Ext.Array.merge(classes.currencyButtonWrapClass,
							currencyButtonWrapClass.currencyButtonWrapClass);
				}
				return currencyButtonWrapClass;
			},

			/**
			 * @inheritdoc Terrasoft.BaseEdit#applyHighlight
			 * @overriden
			 */
			applyHighlight: function() {
				if (!this.rendered) {
					return;
				}
				this.editWrapEl.addCls("base-edit-focus");
			},

			/**
			 * @inheritdoc Terrasoft.BaseEdit#removeHighlight
			 * @overriden
			 */
			removeHighlight: function() {
				this.editWrapEl.removeCls("base-edit-focus");
			},

			/**
			 * Применяет изменения списка валют.
			 * @protected
			 */
			applyCurrencyRateListChanged: function() {
				this.prepareCurrencyMenu();
				var currencyRateList = this.currencyRateList;
				if (!currencyRateList) {
					return;
				}
				var currenciesCount = currencyRateList.getCount();
				if (currenciesCount <= 1) {
					this.setEnableRightIcon(false);
					this.destroyContainerItems();
				} else {
					this.setEnableRightIcon(true);
				}
				this.updateCurrencyButton();
			},

			/**
			 * Создает кнопку изменения валюты.
			 * @protected
			 */
			createCurrencyButton: function() {
				this.currencyMenu = Ext.create("Terrasoft.Menu");
				this.prepareCurrencyMenu();
				this.currencyButton = Ext.create("Terrasoft.Button", {
					menu: this.currencyMenu,
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT
				});
			},

			/**
			 * Создает элементы управления выпадающего контейнера.
			 * @protected
			 */
			createContainerControls: function() {
				this.primaryAmountLabel = Ext.create("Terrasoft.Label");
				this.primaryAmountEdit = Ext.create("Terrasoft.FloatEdit", {
					id: this.id + "-primaryAmountEdit",
					markerValue: "PrimaryAmountEdit"
				});
				this.currencyEdit = Ext.create("Terrasoft.ComboBoxEdit", {
					id: this.id + "-currency",
					markerValue: "Currency"
				});
				this.rateEdit = Ext.create("Terrasoft.FloatEdit", {
					id: this.id + "-rate",
					markerValue: "Rate"
				});
				this.rateCurrencyInfoLabel = Ext.create("Terrasoft.Label");
				this.applyButton = Ext.create("Terrasoft.Button", {
					markerValue: resources.localizableStrings.ApplyButtonCaption,
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					caption: resources.localizableStrings.ApplyButtonCaption
				});
				this.cancelButton = Ext.create("Terrasoft.Button", {
					markerValue: resources.localizableStrings.CancelButtonCaption,
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					caption: resources.localizableStrings.CancelButtonCaption
				});
			},

			/**
			 * Подготавливает меню списка валют для элемента управления валютами.
			 * @protected
			 */
			prepareCurrencyMenu: function() {
				var menu = this.currencyMenu;
				var currencyRateList = this.currencyRateList;
				if (!menu || !currencyRateList) {
					return;
				}
				menu.clearItems();
				if (currencyRateList.getCount() <= 1) {
					return;
				}
				currencyRateList.each(function(item) {
					var menuItem = Ext.create("Terrasoft.MenuItem", {
						caption: item.displayValue,
						markerValue: item.displayValue,
						tag: item.value
					});
					menuItem.on("click", this.onCurrencyMenuItemClick, this);
					menuItem.on("destroy", this.onCurrencyMenuItemDestroy, this);
					menu.addItem(menuItem);
				}, this);
			},

			/**
			 * Подписывается на события элементов управления выпадающего контейнера.
			 * @protected
			 */
			subscribeForContainerControlsEvents: function() {
				this.currencyEdit.on("prepareList", this.onPrepareList, this);
				this.currencyEdit.on("change", this.onCurrencyEditChanged, this);
				this.rateEdit.on("change", this.onRateEditChanged, this);
				this.primaryAmountEdit.on("change", this.onPrimaryAmountEditChanged, this);
				this.applyButton.on("click", this.hide, this);
				this.cancelButton.on("click", this.onCancelClick, this);
			},

			/**
			 * Обновляет элемент управления валютами.
			 * @protected
			 */
			updateCurrencyButton: function() {
				if (!this.currencyButton) {
					return;
				}
				var caption = this.caption;
				var currencyRateList = this.currencyRateList;
				if (currencyRateList) {
					var currency = (this.currency && currencyRateList.getCount() > 1)
						? currencyRateList.find(this.currency.value)
						: null;
					if (currency && this.getCurrencyCode(currency)) {
						caption = caption.concat(", ",  this.getCurrencyCode(currency));
					}
				}
				this.currencyButton.markerValue = caption;
				this.currencyButton.setCaption(caption);
			},

			/**
			 * Возвращает код валюты.
			 * @protected
			 * @param {Object} currency Валюта.
			 * @return {String} Код валюты.
			 *
			 */
			getCurrencyCode: function(currency) {
				if (!currency) {
					return "";
				}
				return currency.Symbol || currency.ShortName;
			},

			/**
			 * Обновляет данные элементов управления в выпадающем контейнере.
			 * @protected
			 */
			updateContainerControls: function() {
				var expandableContainer = this.getContainer();
				if (!(expandableContainer && expandableContainer.visible)) {
					return;
				}
				var currencyRateList = this.currencyRateList;
				var currency = this.currency ? currencyRateList.find(this.currency.value) : null;
				var primaryCurrency = this.primaryCurrency ? currencyRateList.find(this.primaryCurrency.value) : null;
				var primaryCurrencyCaption = resources.localizableStrings.PrimaryAmountCaption;
				var primaryCurrencyDisplayValue = primaryCurrency ? this.getCurrencyCode(primaryCurrency) : "";
				if (!Ext.isEmpty(primaryCurrencyDisplayValue)) {
					primaryCurrencyCaption = primaryCurrencyCaption.concat(", ", primaryCurrencyDisplayValue);
				}
				this.primaryAmountLabel.markerValue = primaryCurrencyCaption;
				this.primaryAmountLabel.setCaption(primaryCurrencyCaption);
				var rateInfoCaption = resources.localizableStrings.RateInfoCaption;
				var currencyDisplayValue = currency ? (currency.ShortName || currency.Symbol) : "";
				var currencyDivision = currency ? currency.Division : "";
				var rateCurrencyInfoCaption = Ext.String.format(rateInfoCaption,
					currencyDisplayValue, currencyDivision, primaryCurrencyDisplayValue);
				this.rateCurrencyInfoLabel.markerValue = rateCurrencyInfoCaption;
				this.rateCurrencyInfoLabel.setCaption(rateCurrencyInfoCaption);
				this.primaryAmountEdit.setEnabled(this.primaryAmountEnabled);
				this.currencyEdit.setEnabled(this.currencyEnabled);
				this.rateEdit.setEnabled(this.rateEnabled && (currency.value !== primaryCurrency.value));
			},

			/**
			 * Уничтожает элементы мультивалютного элемента управления.
			 * @protected
			 */
			destroyContainerItems: function() {
				var container = this.getContainer();
				if (!container) {
					return;
				}
				this.primaryAmountLabel.destroy();
				this.primaryAmountEdit.destroy();
				this.currencyEdit.destroy();
				this.rateEdit.destroy();
				this.rateCurrencyInfoLabel.destroy();
				this.applyButton.destroy();
				this.cancelButton.destroy();
			},

			/**
			 * @inheritdoc Terrasoft.Expandable#getOffset
			 * @overridden
			 */
			getOffset: function() {
				var margin = this.currencyButtonWrapEl.getMargin();
				var width = this.currencyButtonWrapEl.getWidth();
				var offsetX = margin.left + width + margin.right + 1;
				return [offsetX, 1];
			},

			/**
			 * @inheritdoc Terrasoft.Expandable#getContainerConfig
			 * @overridden
			 */
			getContainerConfig: function() {
				this.createContainerControls();
				this.subscribeForContainerControlsEvents();
				return {
					"classes": {
						"wrapClassName": ["multi-currency-edit-expandable"]
					},
					"items": [
						{
							"className": "Terrasoft.Container",
							"id": "dataContainer",
							"classes": {
								"wrapClassName": ["data-container"]
							},
							"items": [
								{
									"className": "Terrasoft.Container",
									"id": "primaryAmountContainer",
									"items": [
										{
											"className": "Terrasoft.Container",
											"id": "primaryAmountLabelContainer",
											"classes": {"wrapClassName": ["item-label"]},
											"items": [
												this.primaryAmountLabel
											]
										},
										{
											"className": "Terrasoft.Container",
											"id": "primaryAmountControlContainer",
											"classes": {"wrapClassName": ["item-control"]},
											"items": [
												this.primaryAmountEdit
											]
										}
									]
								},
								{
									"className": "Terrasoft.Container",
									"id": "CurrencyContainer",
									"items": [
										{
											"className": "Terrasoft.Container",
											"id": "CurrencyLabelContainer",
											"classes": {"wrapClassName": ["item-label"]},
											"items": [
												{
													"className": "Terrasoft.Label",
													"caption": resources.localizableStrings.CurrencyCaption
												}
											]
										},
										{
											"className": "Terrasoft.Container",
											"id": "CurrencyControlContainer",
											"classes": {"wrapClassName": ["item-control"]},
											"items": [
												this.currencyEdit
											]
										}
									]
								},
								{
									"className": "Terrasoft.Container",
									"id": "RateContainer",
									"items": [
										{
											"className": "Terrasoft.Container",
											"id": "RateLabelContainer",
											"classes": {"wrapClassName": ["item-label"]},
											"items": [
												{
													"className": "Terrasoft.Label",
													"caption": resources.localizableStrings.RateCaption
												}
											]
										},
										{
											"className": "Terrasoft.Container",
											"id": "RateControlContainer",
											"classes": {"wrapClassName": ["item-control-rate"]},
											"items": [
												{
													"className": "Terrasoft.Container",
													"id": "RateControlContainer",
													"classes": {"wrapClassName": ["item-control"]},
													"items": [
														this.rateEdit
													]
												},
												{
													"className": "Terrasoft.Container",
													"id": "rateInfoLabelContainer",
													"classes": {"wrapClassName": ["item-label"]},
													"items": [
														this.rateCurrencyInfoLabel
													]
												}
											]
										}
									]
								}
							]
						},
						{
							"className": "Terrasoft.Container",
							"id": "footerContainer",
							"classes": {
								"wrapClassName": ["footer-container"]
							},
							"items": [
								this.applyButton,
								this.cancelButton
							]
						}
					]
				};
			},

			/**
			 * Возвращает конфигурацию привязки к модели для интерфейса миксина {@link Terrasoft.Bindable}.
			 * @protected
			 */
			getBindConfig: function() {
				var bindConfig = this.callParent(arguments);
				var expandableBindConfig = this.mixins.expandable.getBindConfig(arguments);
				Ext.apply(bindConfig, expandableBindConfig);
				var buttonBindConfig = {
					primaryAmount: {
						changeMethod: "setPrimaryAmount",
						changeEvent: "primaryAmountChange"
					},
					currency: {
						changeMethod: "setCurrency",
						changeEvent: "currencyChange"
					},
					primaryCurrency: {
						changeMethod: "setPrimaryCurrency"
					},
					rate: {
						changeMethod: "setRate",
						changeEvent: "rateChange"
					},
					currencyRateList: {
						changeMethod: "setCurrencyRateList"
					},
					primaryAmountEnabled: {
						changeMethod: "setPrimaryAmountEnabled"
					},
					currencyEnabled: {
						changeMethod: "setCurrencyEnabled"
					},
					rateEnabled: {
						changeMethod: "setRateEnabled"
					}
				};
				Ext.apply(bindConfig, buttonBindConfig);
				return bindConfig;
			},

			/**
			 * Устанавливает значение поля, не провоцируя его события.
			 * @protected
			 * @param {Terrasoft.BaseEdit} edit Поле.
			 * @param {Object} value Значение поля.
			 */
			setSilentEditValue: function(edit, value) {
				var container = this.getContainer();
				if (container && container.visible && edit) {
					edit.suspendEvents();
					edit.setValue(value);
					edit.resumeEvents();
				}
			},

			/**
			 * @inheritdoc Terrasoft.BaseEdit#setEnabled
			 * @overridden
			 */
			setEnabled: function(enabled) {
				this.callParent(arguments);
				if (!this.rendered) {
					return;
				}
				var wrapEl = this.getWrapEl();
				if (!Ext.isEmpty(wrapEl)) {
					wrapEl.removeCls(this.disabledClass);
				}
				if (enabled) {
					this.editWrapEl.removeCls(this.disabledClass);
				} else {
					this.editWrapEl.addCls(this.disabledClass);
				}
			},

			/**
			 * Обновляет объект валюты информацией из cписка валют и курсов.
			 * @protected
			 */
			updateCurrencyFromCurrencyList: function() {
				var currency = this.currency;
				if (!Ext.isEmpty(currency)) {
					var currencyValue = currency.value;
					if (!currency.displayValue && !Ext.isEmpty(currencyValue)) {
						currency = this.currencyRateList.find(currencyValue);
						if (!Ext.isEmpty(currency)) {
							this.setCurrency(currency);
							this.updateCurrencyButton();
						}
					}
				}
			},

			/**
			 * Обработчик события нажатия мыши, произошедшего за пределами элемента управления и выпадающего окна.
			 * @protected
			 * @param {Event} e Событие mousedown.
			 */
			onMouseDownCollapse: function(e) {
				var isInEditWrap = e.within(this.editWrapEl);
				var expandableContainer = this.getContainer();
				var isInContainerWrap = !expandableContainer || e.within(expandableContainer.getWrapEl());
				var currencyRateListView = this.currencyEdit.listView;
				var isInCurrencyRateListView = currencyRateListView ? e.within(currencyRateListView.getWrapEl()) : false;
				if (!isInEditWrap && !isInContainerWrap && !isInCurrencyRateListView) {
					this.hide();
				}
			},

			/**
			 * Обработчик события нажатия на правую иконку элемента.
			 * @protected
			 */
			onMarkerWrapClick: function() {
				var expandableContainer = this.getContainer();
				if (expandableContainer && expandableContainer.visible) {
					this.hide();
				} else {
					this.show();
				}
				var el = this.getEl();
				if (el) {
					el.focus();
				}
			},

			/**
			 * @inheritDoc Terrasoft.Component#onAfterRender
			 * @overridden
			 */
			onAfterRender: function() {
				this.callParent(arguments);
				this.currencyButton.render(this.currencyButtonWrapEl);
			},

			/**
			 * @inheritDoc Terrasoft.Component#onAfterReRender
			 * @overridden
			 */
			onAfterReRender: function() {
				this.callParent(arguments);
				this.currencyButton.reRender(null, this.currencyButtonWrapEl);
			},

			/**
			 * Обрабатывает событие нажатия на кнопку "Отмена" в выпадающем контейнере.
			 * @protected
			 */
			onCancelClick: function() {
				var initValues = this.initValues;
				if (initValues) {
					this.setCurrency(initValues.currency);
					this.setRate(initValues.rate);
					this.setPrimaryAmount(initValues.primaryAmount);
					this.setValue(initValues.amount);
				}
				this.hide();
			},

			/**
			 * Обрабатывает событие изменения значения поля валюты.
			 * @protected
			 * @param {Object} value Значение валюты.
			 */
			onCurrencyEditChanged: function(value) {
				this.setCurrency(value);
			},

			/**
			 * Обрабатывает событие изменения значения поля курса валюты.
			 * @protected
			 * @param {Number} value Значение курса валюты.
			 */
			onRateEditChanged: function(value) {
				this.setRate(value);
			},

			/**
			 * Обрабатывает событие изменения значения поля суммы б.в.
			 * @protected
			 * @param {Number} value Значение суммы б.в.
			 */
			onPrimaryAmountEditChanged: function(value) {
				this.setPrimaryAmount(value);
			},

			/**
			 * Обрабатывает событие показа всплывающего контейнера.
			 * @protected
			 */
			onShowContainer: function() {
				var doc = Ext.getDoc();
				doc.on("mousedown", this.onMouseDownCollapse, this);
				this.initValues = {
					amount: this.getValue(),
					primaryAmount: this.primaryAmount,
					currency: this.currency,
					rate: this.rate
				};
				this.setSilentEditValue(this.primaryAmountEdit, this.primaryAmount);
				this.setSilentEditValue(this.currencyEdit, this.currency);
				this.setSilentEditValue(this.rateEdit, this.rate);
				this.updateContainerControls();
			},

			/**
			 * Обрабатывает событие скрытия всплывающего контейнера.
			 * @protected
			 */
			onHideContainer: function() {
				this.initValues = null;
				var doc = Ext.getDoc();
				doc.un("mousedown", this.onMouseDownCollapse, this);
			},

			/**
			 * Обрабатывает событие выбора валюты из меню валют.
			 * @protected
			 * @param {Terrasoft.MenuItem} menuItem Элемент управления меню.
			 */
			onCurrencyMenuItemClick: function(menuItem) {
				var currency = this.currencyRateList.find(menuItem.tag);
				this.setCurrency(currency);
			},

			/**
			 * Обрабатывает событие уничтожения элемента меню валют.
			 * @protected
			 * @param {Terrasoft.MenuItem} menuItem Элемент управления меню.
			 */
			onCurrencyMenuItemDestroy: function(menuItem) {
				menuItem.un("click", this.onCurrencyMenuItemClick, this);
				menuItem.un("destroy", this.onCurrencyMenuItemDestroy, this);
			},

			/**
			 * Обрабатывает событие подготовки списка валют.
			 * @protected
			 */
			onPrepareList: function() {
				this.currencyEdit.loadList(this.currencyRateList);
			},

			/**
			 * @inheritDoc Terrasoft.BaseEdit#onDestroy
			 * @overridden
			 */
			onDestroy: function() {
				this.currencyButton.destroy();
				this.destroyContainerItems();
				this.mixins.expandable.destroy();
			},

			//endregion

			//region Methods: Public

			/**
			 * inheritdoc Terrasoft.Component#constructor
			 * @overridden
			 */
			constructor: function() {
				this.callParent(arguments);
				this.mixins.expandable.init.call(this);
				this.initEvents();
				this.initRightIcon();
				this.createCurrencyButton();
			},

			/**
			 * Устанавливает значение суммы в базовой валюте.
			 * @param {Number} value Значение суммы в базовой валюте.
			 */
			setPrimaryAmount: function(value) {
				var numericValue = this.parseNumber(value);
				var currentValue = this.primaryAmount;
				if (currentValue === numericValue) {
					return;
				}
				this.primaryAmount = numericValue;
				this.fireEvent("primaryAmountChange", numericValue);
				this.setSilentEditValue(this.primaryAmountEdit, numericValue);
			},

			/**
			 * Устанавливает значение валюты.
			 * @param {Object} currency Значение валюты.
			 */
			setCurrency: function(currency) {
				if (!currency) {
					return;
				}
				var currencyId = currency.value;
				if (this.currency && this.currency.displayValue && this.currency.value === currencyId) {
					return;
				}
				var currencyRateList = this.currencyRateList;
				if (!(currencyRateList && currencyRateList.getCount() > 0)) {
					this.currency = {value: currencyId};
					return;
				}
				var listCurrency = currencyRateList.find(currencyId);
				if (!listCurrency) {
					return;
				}
				this.currency = Ext.apply(currency, listCurrency);
				this.fireEvent("currencyChange", currency);
				this.setSilentEditValue(this.currencyEdit, currency);
				this.updateContainerControls();
				this.updateCurrencyButton();
			},

			/**
			 * Устанавливает значение курса.
			 * @param {Number} value Значение курса.
			 */
			setRate: function(value) {
				var numericValue = this.parseNumber(value);
				var currentValue = this.rate;
				if (currentValue === value) {
					return;
				}
				this.rate = numericValue;
				this.fireEvent("rateChange", numericValue);
				this.setSilentEditValue(this.rateEdit, numericValue);
			},

			/**
			 * Устанавливает значение базовой валюты.
			 * @param {Object} value Значение базовой валюты.
			 */
			setPrimaryCurrency: function(value) {
				var currentValue = this.primaryCurrency;
				if (currentValue === value) {
					return;
				}
				this.primaryCurrency = value;
			},

			/**
			 * Устанавливает список валют.
			 * @param {Terrasoft.Collection} value Список валют.
			 */
			setCurrencyRateList: function(value) {
				this.currencyRateList = value;
				this.updateCurrencyFromCurrencyList();
				this.applyCurrencyRateListChanged();
			},

			/**
			 * Метод включает либо отключает элемент управления суммой в базовой валюте выпадающего контейнера.
			 * @param {Boolean} value Признак включенности.
			 */
			setPrimaryAmountEnabled: function(value) {
				var currentValue = this.primaryAmountEnabled;
				if (currentValue === value) {
					return;
				}
				this.primaryAmountEnabled = value;
			},

			/**
			 * Метод включает либо отключает элемент управления валютой в выпадающем контейнере.
			 * @param {Boolean} value Признак включенности.
			 */
			setCurrencyEnabled: function(value) {
				var currentValue = this.currencyEnabled;
				if (currentValue === value) {
					return;
				}
				this.currencyEnabled = value;
				this.currencyButton.setEnabled(value);
			},

			/**
			 * Метод включает либо отключает элемент управления курсом в выпадающем контейнере.
			 * @param {Boolean} value Признак включенности.
			 */
			setRateEnabled: function(value) {
				var currentValue = this.rateEnabled;
				if (currentValue === value) {
					return;
				}
				this.rateEnabled = value;
			}

			//endregion

		});

	}
);
