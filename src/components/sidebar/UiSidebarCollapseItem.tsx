"use Client"

import { Sidebar, SidebarCollapse, SidebarItem, SidebarItems } from "flowbite-react";
import UiSidebarSimpleItem from "./UiSidebarSimpleItem";
import type { UiSidebarCollapseItemProps } from '../../types/UiSidebarCollapseItemProps';


export default function UiSidebarCollapseItem ({name, reactIcon, items}: UiSidebarCollapseItemProps) {
    return (
        <SidebarCollapse icon={reactIcon} label={name}>
            {Object.entries(items).map(([key, value]) => (
                <UiSidebarSimpleItem key={key} name={key}></UiSidebarSimpleItem>
            ))}
        </SidebarCollapse>
    );
}