"use client"

import Link from "next/link"
import { Shield } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function SiteFooter() {
  const [openModal, setOpenModal] = useState<null | "about" | "terms" | "privacy" | "contact">(null)

  return (
    <footer className="border-t py-8 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-campus-primary" />
            <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-campus-primary to-campus-secondary">
              Secure UI
            </span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Secure UI. All rights reserved. Developed by AEO.
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <button className="hover:text-foreground transition-colors" onClick={() => setOpenModal("about")}>
            About
          </button>
          <button className="hover:text-foreground transition-colors" onClick={() => setOpenModal("terms")}>
            Terms
          </button>
          <button className="hover:text-foreground transition-colors" onClick={() => setOpenModal("privacy")}>
            Privacy
          </button>
          <button className="hover:text-foreground transition-colors" onClick={() => setOpenModal("contact")}>
            Contact
          </button>
        </div>
      </div>

      {/* About Modal */}
      <Dialog open={openModal === "about"} onOpenChange={() => setOpenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>About Secure UI</DialogTitle>
            <DialogDescription>
              Secure UI is a campus safety platform that empowers students, staff, and visitors to report incidents, view safety alerts, and collaborate to improve campus security. 
              <br /><br />
              Our mission is to foster a safer, more connected campus community through transparency, engagement, and real-time information sharing.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setOpenModal(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terms Modal */}
      <Dialog open={openModal === "terms"} onOpenChange={() => setOpenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terms of Service</DialogTitle>
            <DialogDescription>
              By using Secure UI, you agree to:
              <ul className="list-disc ml-6 mt-2 space-y-1 text-muted-foreground">
                <li>Provide accurate and truthful information when reporting incidents.</li>
                <li>Respect the privacy and safety of others.</li>
                <li>Not misuse the platform for false reports or harassment.</li>
                <li>Abide by all campus and legal regulations.</li>
              </ul>
              <br />
              For full terms, please contact our support team.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setOpenModal(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Privacy Modal */}
      <Dialog open={openModal === "privacy"} onOpenChange={() => setOpenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
            <DialogDescription>
              Your privacy is important to us. Secure UI:
              <ul className="list-disc ml-6 mt-2 space-y-1 text-muted-foreground">
                <li>Allows anonymous reporting to protect your identity.</li>
                <li>Does not share your personal information without consent.</li>
                <li>Uses your data only for campus safety and platform improvement.</li>
                <li>Secures your information with industry-standard practices.</li>
              </ul>
              <br />
              For detailed privacy information, contact our support team.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setOpenModal(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Modal */}
      <Dialog open={openModal === "contact"} onOpenChange={() => setOpenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Us</DialogTitle>
            <DialogDescription>
              Have questions, feedback, or need support? Reach out to us!
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>Email: <a href="mailto:support@crowdsource.com" className="underline">support@crowdsource.com</a></li>
                <li>Phone: <a href="tel:+1234567890" className="underline">+1 (234) 567-890</a></li>
                <li>Office: Campus Security Office, Main Building</li>
              </ul>
              <br />
              We value your input and are here to help.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setOpenModal(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </footer>
  )
}
