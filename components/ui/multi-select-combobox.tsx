"use client"

import * as React from "react"
import { Check, LucideIcon, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"

interface MultiSelectComboboxProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder: string
  allLabel: string
  icon: LucideIcon
  className?: string
}

export function MultiSelectCombobox({
  options,
  selected,
  onChange,
  placeholder,
  allLabel,
  icon: Icon,
  className,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const toggleOption = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option]
    onChange(newSelected)
  }

  const displayText = React.useMemo(() => {
    if (selected.length === options.length) return allLabel
    if (selected.length === 0) return "NONE SELECTED"
    return `${selected.length} SELECTED`
  }, [selected, options, allLabel])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("cursor-pointer", className)}>
          <InputGroup className="border-swiss h-10 rounded-none border-border bg-background transition-colors hover:bg-muted">
            <InputGroupAddon className="pr-2 pl-3 text-foreground">
              <Icon className="size-4" />
            </InputGroupAddon>
            <div className="flex-1 overflow-hidden text-sm font-black text-ellipsis whitespace-nowrap text-foreground uppercase">
              {displayText}
            </div>
            <InputGroupAddon
              align="inline-end"
              className="pr-3 text-foreground/40"
            >
              <ChevronDown className="size-4" />
            </InputGroupAddon>
          </InputGroup>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[240px] overflow-hidden rounded-none border-2 border-border p-0 shadow-none"
        align="start"
      >
        <Command className="overflow-hidden rounded-none bg-background p-0">
          <div className="flex flex-col border-b-2 border-border">
            <CommandInput
              placeholder={`SEARCH ${placeholder}...`}
              className="h-12 w-full rounded-none border-none bg-transparent font-black text-foreground uppercase placeholder:text-muted-foreground focus:ring-0"
              containerClassName="p-0"
              wrapperClassName="border-none bg-transparent h-12! rounded-none! shadow-none! flex-row-reverse *:text-foreground *:data-[slot=input-group-addon]:pr-3! *:data-[slot=input-group-addon]:pl-0!"
            />
            <div className="flex border-t-2 border-border">
              <button
                type="button"
                onClick={() => onChange(options)}
                className="flex-1 border-r-2 border-border py-3 text-[9px] font-black tracking-widest text-foreground uppercase transition-none hover:bg-foreground hover:text-background"
              >
                [ SELECT ALL ]
              </button>
              <button
                type="button"
                onClick={() => onChange([])}
                className="flex-1 py-3 text-[9px] font-black tracking-widest text-foreground uppercase transition-none hover:bg-foreground hover:text-background"
              >
                [ CLEAR ALL ]
              </button>
            </div>
          </div>
          <CommandList className="max-h-64 rounded-none">
            <CommandEmpty className="p-4 text-xs font-black uppercase opacity-40">
              No results found.
            </CommandEmpty>
            <CommandGroup className="p-0!">
              {options.sort().map((option) => (
                <CommandItem
                  key={option}
                  onSelect={() => toggleOption(option)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-none px-4 py-3 text-[10px] font-black tracking-wider uppercase transition-none",
                    "bg-background text-foreground hover:bg-muted aria-selected:bg-muted aria-selected:text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center border-2 border-border transition-none",
                      selected.includes(option)
                        ? "bg-foreground text-background"
                        : "bg-background"
                    )}
                  >
                    {selected.includes(option) && <Check className="size-3" />}
                  </div>
                  <span className="truncate">{option}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
