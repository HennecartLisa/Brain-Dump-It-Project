"use Client"

import { Sidebar, SidebarItem, SidebarItemGroup, SidebarItems } from "flowbite-react";
import { GoProjectRoadmap } from "react-icons/go";

import { HiArrowSmRight, HiChartPie, HiInbox, HiShoppingBag, HiTable, HiUser, HiViewBoards } from "react-icons/hi";
import type { UiSidebarSimpleItemProps } from '../../types/UiSidebarSimpleItemProps';


export default function UiSidebarSimpleItem ({name, reactIcon = GoProjectRoadmap, onClick, isActive = false}: UiSidebarSimpleItemProps) {
    return (
            <SidebarItem 
                icon={reactIcon} 
                onClick={onClick}
                className={isActive ? 'bg-blue-100 text-blue-700' : ''}
            >
                {name}
            </SidebarItem>
    );
}