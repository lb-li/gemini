"use client"

import * as React from "react"
import { Icon, type IconProps } from "@/components/ui/icon"
import { IconMap, type IconName } from "./index"

interface IconComponentProps extends Omit<IconProps, 'children'> {
  name: IconName
}

export const IconComponent = React.forwardRef<SVGSVGElement, IconComponentProps>(
  ({ name, ...props }, ref) => {
    const IconElement = IconMap[name]
    
    if (!IconElement) {
      console.warn(`Icon "${name}" not found in IconMap`)
      return null
    }
    
    return (
      <Icon {...props}>
        <IconElement ref={ref} />
      </Icon>
    )
  }
)

IconComponent.displayName = "IconComponent"

export { IconComponent as EnterpriseIcon }