import { Sidebar, SidebarItemGroup, SidebarItems } from "flowbite-react";
import { HiArrowSmLeft, HiInbox } from "react-icons/hi";
import { MdHistory, MdAccountCircle, MdPsychology, MdGroups } from "react-icons/md";
import { useAuth } from '../../auth/useAuth.ts';
import { VOCAB } from '../../vocal.ts';



import UiSidebarSimpleItem from "./UiSidebarSimpleItem";
import type { UiSidebarProps } from '../../types/UiSidebarProps';

export default function UiSidebar ({ onViewChange, activeView = 'my-brain' }: UiSidebarProps) {
      const { signOut } = useAuth();
    
    return (
        <>
        <Sidebar aria-label="Sidebar" className="fixed left-1 top-1 m-4 h-[90vh] overflow-y-auto rounded-xl shadow-lg">

        <SidebarItems>
            <SidebarItemGroup>
            <UiSidebarSimpleItem 
                name="My account" 
                reactIcon={MdAccountCircle}
                onClick={() => onViewChange?.('my-account')}
                isActive={activeView === 'my-account'}
            ></UiSidebarSimpleItem>
            <UiSidebarSimpleItem 
                name={VOCAB.MY_BRAIN} 
                reactIcon={MdPsychology}
                onClick={() => onViewChange?.('my-brain')}
                isActive={activeView === 'my-brain'}
            ></UiSidebarSimpleItem>
            <UiSidebarSimpleItem
                name="Projects"
                reactIcon={HiInbox}
                onClick={() => onViewChange?.('projects')}
                isActive={activeView === 'projects'}
            />
            <UiSidebarSimpleItem 
                name={VOCAB.MY_VILLAGE} 
                reactIcon={MdGroups}
                onClick={() => onViewChange?.('my-village')}
                isActive={activeView === 'my-village'}
            ></UiSidebarSimpleItem>
            <UiSidebarSimpleItem 
                name="History" 
                reactIcon={MdHistory}
                onClick={() => onViewChange?.('history')}
                isActive={activeView === 'history'}
            ></UiSidebarSimpleItem>

            </SidebarItemGroup>
            <SidebarItemGroup>
            <UiSidebarSimpleItem name="Sign out" reactIcon={HiArrowSmLeft} onClick={signOut}></UiSidebarSimpleItem>

            </SidebarItemGroup>


        </SidebarItems>
        </Sidebar>
        </>
    );
}