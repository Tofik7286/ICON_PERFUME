'use client';
import React from 'react';
import styles from '@/app/(home)/styles/modal.module.css';
import { IoCloseOutline } from 'react-icons/io5';
import { useSelector, useDispatch } from 'react-redux';
import { closeModal } from '../redux/modalSlice';
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';

const OTP = dynamic(() => import('./OTP'), { ssr: false });
const Address = dynamic(() => import('./Address'), { ssr: false });
const ReviewForm = dynamic(() => import('./ReviewForm'), { ssr: false });

const Modal = () => {
    const dispatch = useDispatch();
    const { isOpen, component, modalProps } = useSelector((state) => state.modal);

    if (!isOpen) return null;

    const closeHandler = () => {
        if (component === 'OTP') return;
        dispatch(closeModal());
    };

    const renderComponent = () => {
        switch (component) {
            case 'OTP':
                return <OTP />;
            case 'Address':
                return <Address />;
            case 'ReviewForm':
                return <ReviewForm id={modalProps?.id} />;
            default:
                return null;
        }
    };

    return createPortal(
        <>
            <div className={`${styles.modal_backdrop} ${styles.active}`} onClick={closeHandler} />
            <div
                className={`${styles.modal} ${styles.active}`}
                style={{ '--width': component === 'Address' || component === 'ReviewForm' ? 38 : 30 }}
            >
                {component !== 'OTP' && (
                    <div className={styles.icon}>
                        <IoCloseOutline onClick={closeHandler} />
                    </div>
                )}
                {renderComponent()}
            </div>
        </>,
        document.body
    );
};

export default Modal;
