import type { Category, Service } from '@homedock/types';
import { IconPicker } from '../IconPicker';
import { ServiceIcon } from '../ServiceIcon';
import { buildUrl, splitUrl } from '../../lib/dashboard-utils';

type SettingsCategoriesSectionProps = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  draftCategories: Category[];
  addCategory: () => void;
  updateCategory: (categoryId: string, patch: Partial<Category>) => void;
  moveCategory: (index: number, direction: number) => void;
  removeCategory: (categoryId: string) => void;
  addService: (categoryId: string) => void;
  updateService: (
    categoryId: string,
    serviceId: string,
    patch: Partial<Service>
  ) => void;
  moveService: (categoryId: string, serviceIndex: number, direction: number) => void;
  removeService: (categoryId: string, serviceId: string) => void;
};

export function SettingsCategoriesSection({
  t,
  draftCategories,
  addCategory,
  updateCategory,
  moveCategory,
  removeCategory,
  addService,
  updateService,
  moveService,
  removeService
}: SettingsCategoriesSectionProps) {
  return (
    <section className="settings-section">
      <div className="section-header">
        <h3>{t('categoryTitle')}</h3>
        <button
          type="button"
          className="button secondary"
          onClick={addCategory}
        >
          {t('categoryAdd')}
        </button>
      </div>

      <div className="category-editor-list">
        {draftCategories.map((category, categoryIndex) => (
          <div key={category.id} className="category-editor">
            <div className="category-editor-head">
              <input
                type="text"
                value={category.name}
                onChange={(event) =>
                  updateCategory(category.id, {
                    name: event.target.value
                  })
                }
              />
              <input
                type="color"
                value={category.color ?? '#7ef5d2'}
                onChange={(event) =>
                  updateCategory(category.id, {
                    color: event.target.value
                  })
                }
              />
              <div className="editor-actions">
                <button
                  type="button"
                  onClick={() => moveCategory(categoryIndex, -1)}
                >
                  {'\u2191'}
                </button>
                <button
                  type="button"
                  onClick={() => moveCategory(categoryIndex, 1)}
                >
                  {'\u2193'}
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => removeCategory(category.id)}
                >
                  {t('delete')}
                </button>
              </div>
            </div>

            <div className="service-editor-list">
              {(category.services ?? []).map((service, serviceIndex) => {
                const { protocol, rest } = splitUrl(service.url ?? '');

                return (
                  <div key={service.id} className="service-editor">
                    <div className="service-editor-head">
                      <div className="service-preview">
                        <ServiceIcon service={service} size={22} />
                      </div>
                      <input
                        type="text"
                        value={service.name}
                        onChange={(event) =>
                          updateService(category.id, service.id, {
                            name: event.target.value
                          })
                        }
                      />
                      <div className="editor-actions">
                        <button
                          type="button"
                          onClick={() => moveService(category.id, serviceIndex, -1)}
                        >
                          {'\u2191'}
                        </button>
                        <button
                          type="button"
                          onClick={() => moveService(category.id, serviceIndex, 1)}
                        >
                          {'\u2193'}
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => removeService(category.id, service.id)}
                        >
                          {t('delete')}
                        </button>
                      </div>
                    </div>

                    <div className="service-editor-hint">
                      {t('iconPriorityHint')}
                    </div>
                    <div className="service-editor-grid">
                      <div className="field">
                        <label>{t('iconName')}</label>
                        <IconPicker
                          value={service.icon ?? ''}
                          onChange={(value) =>
                            updateService(category.id, service.id, {
                              icon: value
                            })
                          }
                          placeholder={t('iconNamePlaceholder')}
                        />
                      </div>
                      <div className="field">
                        <label>{t('iconUrl')}</label>
                        <input
                          type="text"
                          value={service.iconUrl ?? ''}
                          onChange={(event) =>
                            updateService(category.id, service.id, {
                              iconUrl: event.target.value
                            })
                          }
                          placeholder="https://.../icon.png"
                        />
                      </div>
                      <div className="field url-field">
                        <label>{t('urlLabel')}</label>
                        <div className="url-input">
                          <select
                            value={protocol}
                            onChange={(event) =>
                              updateService(category.id, service.id, {
                                url: buildUrl(event.target.value, rest)
                              })
                            }
                          >
                            <option value="http">http://</option>
                            <option value="https">https://</option>
                          </select>
                          <input
                            type="text"
                            value={rest}
                            onChange={(event) =>
                              updateService(category.id, service.id, {
                                url: buildUrl(protocol, event.target.value)
                              })
                            }
                            placeholder="host:port/path"
                          />
                        </div>
                      </div>
                      <div className="field">
                        <label>{t('descriptionLabel')}</label>
                        <input
                          type="text"
                          value={service.description ?? ''}
                          onChange={(event) =>
                            updateService(category.id, service.id, {
                              description: event.target.value
                            })
                          }
                          placeholder={t('serviceDescPlaceholder')}
                        />
                      </div>
                    </div>

                    <div className="service-editor-options">
                      <label className="checkbox-pill">
                        <input
                          type="checkbox"
                          checked={Boolean(service.isFavorite)}
                          onChange={(event) =>
                            updateService(category.id, service.id, {
                              isFavorite: event.target.checked
                            })
                          }
                        />
                        {t('favoriteLabel')}
                      </label>
                      <label className="checkbox-pill">
                        <input
                          type="checkbox"
                          checked={Boolean(service.requiresAuth)}
                          onChange={(event) =>
                            updateService(category.id, service.id, {
                              requiresAuth: event.target.checked
                            })
                          }
                        />
                        {t('authRequiredLabel')}
                      </label>
                      <div className="field inline">
                        <label>{t('targetLabel')}</label>
                        <select
                          value={service.target ?? '_blank'}
                          onChange={(event) =>
                            updateService(category.id, service.id, {
                              target: event.target.value
                            })
                          }
                        >
                          <option value="_self">{t('targetSelf')}</option>
                          <option value="_blank">{t('targetBlank')}</option>
                          <option value="window">{t('targetWindow')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button
                type="button"
                className="button ghost"
                onClick={() => addService(category.id)}
              >
                {t('serviceAdd')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
