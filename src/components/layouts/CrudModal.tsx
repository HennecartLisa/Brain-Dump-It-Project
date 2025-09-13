import { Button, Modal } from "flowbite-react";
import { BsThreeDots } from "react-icons/bs";
import type { BrainDumpOption } from "../../types/BrainDumpOptions";
import { useState } from "react";
import { VOCAB } from "../../vocal";

export default function CrudModal(brainDumpType: BrainDumpOption) {
    const [openModal, setOpenModal] = useState(false);
    const [listTitle, setListTitle] = useState("");
    const [listDescription, setListDescription] = useState("");
    const [listTags, setListTags] = useState([]);
    const [listPriority, setListPriority] = useState(0);
    const [listStatus, setListStatus] = useState(0);
    const [listDueDate, setListDueDate] = useState(new Date());
    const [listAssignee, setListAssignee] = useState("");

    return (
        <>
        <Button className="bg-transparent border-none p-2 text-gray-600 hover:bg-transparent hover:text-black focus:outline-none" onClick={() => setOpenModal(true)}>
            <BsThreeDots size={20} />
        </Button>
        
        <Modal show={openModal} onClose={() => setOpenModal(false)}>
            <label htmlFor="name">{VOCAB[`${brainDumpType}_NAME`]}</label>
        </Modal>
        </>
    )
}