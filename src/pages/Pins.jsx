import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import PinDetailModal from '../components/PinDetailModal';
import PinListerModal from '../components/PinListerModal';
import { PinImage } from '../components/UserPins';

const Pins = () => {
  const { t } = useTranslation();
  const { refreshToken } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePins, setActivePins] = useState([]);
  const [inactivePins, setInactivePins] = useState([]);
  const [isAutoEquip, setIsAutoEquip] = useState(true);
  const [isSavingLoadout, setIsSavingLoadout] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [isListerModalOpen, setIsListerModalOpen] = useState(false);

  const fetchPins = useCallback(async () => {
    try {
      const response = await api.get('/user/profile');
      const data = response.data;
      setProfileData(data);
      setIsAutoEquip(data.auto_equip_pins);
      const activeIds = new Set(data.activePinIds);
      setActivePins(data.ownedPins.filter((pin) => activeIds.has(pin.pin_id)));
      setInactivePins(data.ownedPins.filter((pin) => !activeIds.has(pin.pin_id)));
    } catch (err) {
      console.error('Failed to load pins', err);
      setError(t('pins_page.error_load', 'We could not load your pins. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const loadPins = async () => {
      try {
        await refreshToken();
        await fetchPins();
      } catch (err) {
        console.error('Failed to refresh token before loading pins', err);
        setError(t('pins_page.error_load', 'We could not load your pins. Please try again.'));
        setIsLoading(false);
      }
    };

    loadPins();
  }, [refreshToken, fetchPins, t]);

  const handleToggleAutoEquip = async () => {
    const nextState = !isAutoEquip;
    setIsAutoEquip(nextState);
    try {
      await api.put('/user/pins/auto-equip', { isEnabled: nextState });
      if (nextState) {
        fetchPins();
      }
    } catch (err) {
      console.error('Failed to toggle auto equip', err);
      setIsAutoEquip(!nextState);
    }
  };

  const handleEquipPin = (pinToEquip) => {
    if (activePins.length >= profileData.totalPinSlots) {
      alert(t('pins_page.no_slots_alert', 'All of your pin slots are full. Unequip a pin first.'));
      return;
    }

    setActivePins((prev) => [...prev, pinToEquip]);
    setInactivePins((prev) => prev.filter((pin) => pin.pin_id !== pinToEquip.pin_id));
    setSelectedPin(null);
  };

  const handleUnequipPin = (pinToUnequip) => {
    setInactivePins((prev) => [...prev, pinToUnequip]);
    setActivePins((prev) => prev.filter((pin) => pin.pin_id !== pinToUnequip.pin_id));
    setSelectedPin(null);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    if (
      source.droppableId === 'inactive' &&
      destination.droppableId.startsWith('active-slot')
    ) {
      if (activePins.length >= profileData.totalPinSlots) return;
      const pinToMove = inactivePins[source.index];
      const updatedInactive = Array.from(inactivePins);
      updatedInactive.splice(source.index, 1);
      const updatedActive = Array.from(activePins);
      updatedActive.push(pinToMove);
      setActivePins(updatedActive);
      setInactivePins(updatedInactive);
    }

    if (
      source.droppableId.startsWith('active-slot') &&
      destination.droppableId === 'inactive'
    ) {
      const pinToMove = activePins[source.index];
      const updatedActive = Array.from(activePins);
      updatedActive.splice(source.index, 1);
      const updatedInactive = Array.from(inactivePins);
      updatedInactive.push(pinToMove);
      setActivePins(updatedActive);
      setInactivePins(updatedInactive);
    }
  };

  const handleSaveChanges = async () => {
    setIsSavingLoadout(true);
    try {
      const activePinIds = activePins.map((pin) => pin.pin_id);
      await api.post('/user/active-pins', { activePinIds });
    } catch (err) {
      console.error('Failed to save pin loadout', err);
      alert(t('pins_page.save_error', 'We could not save your loadout. Please try again.'));
    } finally {
      setIsSavingLoadout(false);
    }
  };

  if (isLoading) {
    const totalSlots = profileData.totalPinSlots;
    return (
    <Layout>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="pins-page">
          <header className="pins-page__header">
            <span className="eyebrow-text">{t('pins_page.eyebrow')}</span>
            <h1>{t('pins_page.title')}</h1>
            <p>{t('pins_page.subtitle')}</p>
          </header>

          <section className="pins-overview-grid">
            <article className="pins-overview-card">
              <h3>{t('pins_page.active_summary')}</h3>
              <p className="pins-overview-card__metric">{`${activePins.length}/${totalSlots}`}</p>
              <p className="pins-overview-card__meta">{t('pins_page.active_summary_hint')}</p>
            </article>
            <article className="pins-overview-card">
              <h3>{t('pins_page.collection_summary')}</h3>
              <p className="pins-overview-card__metric">{profileData.ownedPins.length}</p>
              <p className="pins-overview-card__meta">{t('pins_page.collection_summary_hint')}</p>
            </article>
            {profileData.account_tier >= 2 ? (
              <Link to="/marketplace" className="card-link-wrapper">
                <article className="pins-overview-card pins-overview-card--clickable">
                  <h3>{t('pins_page.marketplace_summary')}</h3>
                  <p className="pins-overview-card__metric pins-overview-card__metric--unlocked">{t('pins_page.marketplace_access')}</p>
                  <p className="pins-overview-card__meta">{t('pins_page.marketplace_summary_hint')}</p>
                </article>
              </Link>
            ) : (
              <article className="pins-overview-card pins-overview-card--locked">
                <h3>{t('pins_page.marketplace_summary')}</h3>
                <p className="pins-overview-card__metric">{t('pins_page.marketplace_locked')}</p>
                <p className="pins-overview-card__meta">{t('pins_page.marketplace_summary_hint')}</p>
              </article>
            )}
          </section>

          <section className="pins-management">
            <div className="pins-management__intro">
              <h2>{t('pins_page.management_title')}</h2>
              <p>{t('pins_page.management_copy')}</p>
              <div className="toggle-group">
                <span>{t('pins_page.auto_equip_label')}</span>
                <label className="switch"><input type="checkbox" checked={isAutoEquip} onChange={handleToggleAutoEquip} /><span className="slider round" /></label>
              </div>
            </div>
            <div className={`pins-board ${isAutoEquip ? 'pins-board--disabled' : ''}`}>
              <div className="pins-board__slots">
                {Array.from({ length: totalSlots }).map((_, index) => {
                  const pinInSlot = activePins[index];
                  return (
                    <Droppable key={`slot-${index}`} droppableId={`active-slot-${index}`} isDropDisabled={isAutoEquip}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`pins-slot ${snapshot.isDraggingOver ? 'pins-slot--over' : ''}`}
                          onClick={() => !isAutoEquip && pinInSlot && setSelectedPin(pinInSlot)}
                        >
                          {pinInSlot ? (
                            <Draggable draggableId={pinInSlot.pin_id.toString()} index={index} isDragDisabled={isAutoEquip}>
                              {(dragProvided) => (
                                <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
                                  <PinImage pinName={pinInSlot.pin_name} imageFilename={pinInSlot.image_filename} />
                                </div>
                              )}
                            </Draggable>
                          ) : ( <span className="pins-slot__empty-text">{t('pins_page.empty_slot')}</span> )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  );
                })}
              </div>
              {profileData.account_tier < 10 && (
                <div className="pins-board__locked"><span>{t('pins_page.locked_slots', { tier: profileData.account_tier + 1 })}</span></div>
              )}
              <button className="btn-primary" onClick={handleSaveChanges} disabled={isSavingLoadout || isAutoEquip}>
                {isSavingLoadout ? t('pins_page.saving') : t('pins_page.save_button')}
              </button>
            </div>
            {isAutoEquip && (<p className="pins-management__helper">{t('pins_page.auto_equip_helper')}</p>)}
          </section>

          <section className="pins-collection">
            <div className="pins-collection__header">
              <div>
                <h2>{t('pins_page.collection_title')}</h2>
                <p>{t('pins_page.collection_copy')}</p>
              </div>
              <button className="btn-secondary btn-sm" onClick={() => setIsListerModalOpen(true)} disabled={isAutoEquip || inactivePins.length === 0}>
                {t('pins_page.list_button')}
              </button>
            </div>
            <Droppable droppableId="inactive" direction="horizontal" isDropDisabled={isAutoEquip}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="pins-collection__grid">
                  {inactivePins.length === 0 && (<p className="pins-collection__empty">{t('pins_page.empty_collection')}</p>)}
                  {inactivePins.map((pin, index) => (
                    <Draggable key={pin.pin_id} draggableId={pin.pin_id.toString()} index={index} isDragDisabled={isAutoEquip}>
                      {(dragProvided) => (
                        <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps} onClick={() => !isAutoEquip && setSelectedPin(pin)} className="pins-collection__item">
                          <PinImage pinName={pin.pin_name} imageFilename={pin.image_filename} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </section>

          <section className="pins-playbook">
            <h2>{t('pins_page.playbook_title')}</h2>
            <div className="pins-playbook__grid">
              <div className="pins-playbook__card"><h3>{t('pins_page.playbook_step_one_title')}</h3><p>{t('pins_page.playbook_step_one_copy')}</p></div>
              <div className="pins-playbook__card"><h3>{t('pins_page.playbook_step_two_title')}</h3><p>{t('pins_page.playbook_step_two_copy')}</p></div>
              <div className="pins-playbook__card"><h3>{t('pins_page.playbook_step_three_title')}</h3><p>{t('pins_page.playbook_step_three_copy')}</p></div>
            </div>
          </section>
        </div>
      </DragDropContext>

      <PinDetailModal isOpen={!!selectedPin} onClose={() => setSelectedPin(null)} pin={selectedPin} isActive={activePins.some((p) => p.pin_id === selectedPin?.pin_id)} onEquip={handleEquipPin} onUnequip={handleUnequipPin} />
      <PinListerModal isOpen={isListerModalOpen} onClose={() => setIsListerModalOpen(false)} inactivePins={inactivePins} onListSuccess={fetchPins} />
    </Layout>
  
  );
};
}
export default Pins;
