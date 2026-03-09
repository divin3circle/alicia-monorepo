"use client"

import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "framer-motion"
import { ChevronDown, Shirt, Briefcase, Smartphone, Home, Layers, LucideIcon } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

// Custom hook for click outside detection
function useClickAway(ref: React.RefObject<HTMLElement>, handler: (event: MouseEvent | TouchEvent) => void) {
  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler(event)
    }

    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)

    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref, handler])
}

// Types
export interface DropdownItem {
  id: string
  label: string
  icon: LucideIcon
  color: string
}

interface FluidDropdownProps {
  items: DropdownItem[]
  onSelect: (item: DropdownItem) => void
  placeholder?: string
  className?: string
}

// Icon wrapper with animation
const IconWrapper = ({
  icon: Icon,
  isHovered,
  color,
}: { icon: LucideIcon; isHovered: boolean; color: string }) => (
  <motion.div 
    className="w-4 h-4 mr-2 relative" 
    initial={false} 
    animate={isHovered ? { scale: 1.2 } : { scale: 1 }}
  >
    <Icon className="w-4 h-4 text-muted-foreground/60" />
    {isHovered && (
      <motion.div
        className="absolute inset-0"
        style={{ color }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <Icon className="w-4 h-4" strokeWidth={2} />
      </motion.div>
    )}
  </motion.div>
)

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

export function FluidDropdown({ items, onSelect, placeholder = "Select an option", className }: FluidDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState<DropdownItem | null>(null)
  const [hoveredId, setHoveredId] = React.useState<string | null>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  useClickAway(dropdownRef, () => setIsOpen(false))

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={cn("w-full relative", className)}
        ref={dropdownRef}
      >
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl text-sm font-medium transition-all px-4",
              "bg-background/50 border border-input focus:ring-2 focus:ring-amber-500/20",
              "h-12",
              isOpen && "bg-accent/40 border-amber-500/50",
            )}
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <span className="flex items-center">
              {selectedItem ? (
                <>
                  <IconWrapper 
                    icon={selectedItem.icon} 
                    isHovered={false} 
                    color={selectedItem.color} 
                  />
                  {selectedItem.label}
                </>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center w-5 h-5"
            >
              <ChevronDown className="w-4 h-4 opacity-50" />
            </motion.div>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 0, height: 0 }}
                animate={{
                  opacity: 1,
                  y: 8,
                  height: "auto",
                  transition: {
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    mass: 1,
                  },
                }}
                exit={{
                  opacity: 0,
                  y: 0,
                  height: 0,
                  transition: {
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    mass: 1,
                  },
                }}
                className="absolute left-0 right-0 top-full z-50 origin-top"
                onKeyDown={handleKeyDown}
              >
                <div
                  className="w-full rounded-2xl border bg-background/95 backdrop-blur-xl p-1 shadow-xl overflow-hidden"
                >
                  <motion.div 
                    className="py-1 relative max-h-[300px] overflow-y-auto" 
                    variants={containerVariants} 
                    initial="hidden" 
                    animate="visible"
                  >
                    {items.map((item, index) => (
                      <motion.button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedItem(item)
                          onSelect(item)
                          setIsOpen(false)
                        }}
                        onMouseEnter={() => setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={cn(
                          "relative flex w-full items-center px-3 py-2.5 text-sm rounded-xl transition-colors duration-150",
                          selectedItem?.id === item.id || hoveredId === item.id
                            ? "bg-amber-500/5 text-amber-600 dark:text-amber-500"
                            : "text-muted-foreground hover:bg-accent/50",
                        )}
                        whileTap={{ scale: 0.98 }}
                        variants={itemVariants}
                      >
                        <IconWrapper
                          icon={item.icon}
                          isHovered={hoveredId === item.id}
                          color={item.color}
                        />
                        {item.label}
                      </motion.button>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </MotionConfig>
  )
}
