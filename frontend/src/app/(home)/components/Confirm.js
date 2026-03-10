'use client'

import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeConfirmModal, selectConfirmState } from "../redux/confirmSlice";
import { loader } from "../redux/loaderSlice";
import styles from '@/app/(home)/styles/modal.module.css';
import { IoCloseOutline } from "react-icons/io5";
import { AiOutlineUserDelete } from "react-icons/ai";

const ConfirmModal = () => {

  const dispatch = useDispatch();
  const { isOpen, message, onConfirm, loading } = useSelector(selectConfirmState);

  const modalRef = useRef();

  const handleConfirm = async () => {
    if (onConfirm) {
      dispatch(loader(true))
      try {
        await onConfirm(); // Execute the provided function and wait for it to complete
      } catch (error) {

      } finally {
        dispatch(loader(false))
        dispatch(closeConfirmModal());
      }
    }
  };

  const handleClose = () => {
    dispatch(closeConfirmModal());
  };

  const handleModelCLickedOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      dispatch(closeConfirmModal());
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleModelCLickedOutside);
    return () => {
      document.removeEventListener('mousedown', handleModelCLickedOutside);
    };
  }, []);

  return (
    <>
      <div className={`${styles.modal_backdrop} ${isOpen ? styles.active : ''} `} onClick={handleClose}></div>
      <div className={`${styles.modal} ${isOpen ? styles.active : styles.closing}`} style={{ "--width": 30 }}>
        <div className={styles.icon} style={{ top: "5%", right: "4%" }}>
          <IoCloseOutline onClick={handleClose} />
        </div>
        <div className={`${styles.content} w-100`}>
          <div className={styles.content_icon} style={{background: "#FA807288 !important"}}>
            <AiOutlineUserDelete />
          </div>
          <h4>{message.title}</h4>
          <p>{message.description}</p>
          <div className="mt-4 flex justify-end w-100 space-x-2">
            <button
              onClick={handleClose}
              
              className="px-4 w-50 py-2 text-sm font-medium text-gray-600 bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              style={{background: "#D22B2B"}}
              className="px-4 w-50 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;
