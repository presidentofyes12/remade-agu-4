import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

const DAO_AGREEMENT_KEY = 'daoAgreementAccepted';

interface DaoAgreementModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onOpenChange: (open: boolean) => void;
}

export function DaoAgreementModal({ isOpen, onAccept, onOpenChange }: DaoAgreementModalProps) {
  
  const handleAccept = () => {
    localStorage.setItem(DAO_AGREEMENT_KEY, 'true');
    onAccept();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>DAO Membership Terms</DialogTitle>
          <DialogDescription>
            To participate in this DAO, you must read and accept the following governing terms, will, and rights framework.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-6 space-y-6 text-sm">
          {/* The Original Will Section */}
          <section>
            <h2 className="text-lg font-semibold mb-3">"The Original Will"</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">FOUNDATIONAL LEVEL (-8.33 to 25.00)</h3>
                <ol className="list-decimal pl-6 space-y-2 mt-2">
                  <li><strong>FOUNDATIONAL UNDERSTANDING</strong><br />Original Will: "I commit to acknowledging and understanding my starting point (Legal Ground Zero), recognizing that all growth begins with acceptance of current limitations"<br />Legal Provision: "Initial awareness develops from Primary Void (-8.33) through Secondary Void (-7.41) to Legal Ground Zero (0.00), requiring honest self-assessment and limitation acceptance."</li>
                  <li><strong>POWER RESPONSIBILITY</strong><br />Original Will: "I commit to developing and wielding power responsibly, recognizing that increased capability brings proportional responsibility"<br />Legal Provision: "Power development proceeds through Power States (3.70-5.56) to Formation States (6.48-8.33), requiring demonstrated responsible use of increasing capability."</li>
                  <li><strong>SYSTEMATIC PROGRESSION</strong><br />Original Will: "I commit to systematic and patient development, respecting natural growth sequences and avoiding premature advancement"<br />Legal Provision: "Developmental progression advances through Authority States (13.89-16.67) to Domain States (17.59-19.44), requiring validated sequential advancement."</li>
                   <li><strong>INNER STRENGTH</strong><br />Original Will: "I commit to developing inner strength and resilience, acknowledging the reality of both visible and invisible challenges"<br />Legal Provision: "Personal development advances through Formation States (6.48-8.33) to Power Domain states (28.70-30.56), requiring demonstrated resilience in all challenges."</li>
                  <li><strong>SACRIFICIAL SERVICE</strong><br />Original Will: "I commit to expressing love through concrete action, serving others sacrificially regardless of their attitude toward me"<br />Legal Provision: "Service capability advances through Power States (3.70-5.56) to Authority States (13.89-16.67), requiring demonstrated selfless action."</li>
                </ol>
              </div>
              <div>
                <h3 className="font-medium">INTERMEDIATE LEVEL (25.00-50.00)</h3>
                <ol start={6} className="list-decimal pl-6 space-y-2 mt-2">
                  <li><strong>INTEGRATION MASTERY</strong><br />Original Will: "I commit to mastering each level of development before seeking advancement, ensuring solid foundations for future growth"<br />Legal Provision: "Integration capability develops through Jurisdiction levels (25.93-27.78) to Integration states (34.26-36.11), requiring thorough mastery."</li>
                  <li><strong>INCLUSIVE COMMUNITIES</strong><br />Original Will: "I commit to building and nurturing inclusive communities where diversity is valued and unity is fostered through mutual understanding"<br />Legal Provision: "Community development proceeds through Integration states (34.26-36.11) to Complex Formation (37.04), requiring demonstrated inclusivity."</li>
                  <li><strong>HIGHER PRINCIPLES</strong><br />Original Will: "I commit to living by higher principles that promote collective flourishing, recognizing my role in creating positive social transformation"<br />Legal Provision: "Principle-based authority evolves through Authority Complex states (20.37-22.22) to Sovereign States (23.15-25.00), requiring validated social impact."</li>
                </ol>
              </div>
              <div>
                <h3 className="font-medium">ADVANCED LEVEL (50.00-75.00)</h3>
                 <ol start={9} className="list-decimal pl-6 space-y-2 mt-2">
                  <li><strong>FIELD AWARENESS</strong><br />Original Will: "I commit to maintaining awareness of my influence field, understanding how my development affects others within my sphere"<br />Legal Provision: "Field consciousness develops through Unified Fields (50.93-52.78) to Perfect Fields (64.81-66.67), requiring demonstrated sphere awareness."</li>
                  <li><strong>SOVEREIGN RESPONSIBILITY</strong><br />Original Will: "I commit to exercising sovereign authority with wisdom, recognizing that true sovereignty comes with obligation to serve"<br />Legal Provision: "Sovereign capability advances through Sovereign Fields (59.26-61.11) to Authority Fields (62.04-63.89), requiring proven wise leadership."</li>
                  <li><strong>PERFECT/ABSOLUTE BALANCE</strong><br />Original Will: "I commit to balancing perfect ideals with practical reality, striving for excellence while accepting human limitations"<br />Legal Provision: "Balance mastery evolves through Perfect Fields (64.81-66.67) to Absolute Fields (73.15-75.00), requiring demonstrated practical wisdom."</li>
                </ol>
              </div>
               <div>
                <h3 className="font-medium">TRANSCENDENT LEVEL (75.00-100.00)</h3>
                 <ol start={12} className="list-decimal pl-6 space-y-2 mt-2">
                  <li><strong>UNIVERSAL PERSPECTIVE</strong><br />Original Will: "I commit to developing universal awareness, understanding my role in the larger context of human development"<br />Legal Provision: "Universal awareness advances through Universal Fields (78.70-80.56) to Universal states (81.48-83.33), requiring proven collective consciousness."</li>
                  <li><strong>KNOWLEDGE SHARING</strong><br />Original Will: "I commit to sharing knowledge and understanding that uplifts others, actively participating in humanity's collective development"<br />Legal Provision: "Knowledge distribution capability evolves through Universal Fields (78.70-80.56) to Transcendent Fields (84.26-86.11), requiring validated collective impact."</li>
                  <li><strong>TRUTH SEEKING</strong><br />Original Will: "I commit to seeking and standing for truth, even when costly, while maintaining humility in my understanding"<br />Legal Provision: "Truth-seeking authority advances through Absolute Fields (73.15-75.00) to Ultimate Universal states (89.81-91.67), requiring validated wisdom achievement."</li>
                  <li><strong>ETHICAL INTEGRITY</strong><br />Original Will: "I commit to living with integrity and ethical consistency, aligning my actions with my highest principles"<br />Legal Provision: "Ethical authority progresses through Ultimate Universal states (89.81-91.67) to Absolute Universal states (92.59-94.44), requiring proven ethical leadership."</li>
                  <li><strong>COMPLETE RESTORATION</strong><br />Original Will: "I commit to working toward complete restoration of harmony in all relationships - personal, social, and environmental"<br />Legal Provision: "Restoration capability evolves through Total Universal states (95.37-97.22) to Final Unity (100.00), requiring complete harmony achievement."</li>
                </ol>
              </div>
            </div>
          </section>

          {/* DAO Rights Framework Section */}
          <section>
            <h2 className="text-lg font-semibold mb-3">DAO Rights Framework</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium">Membership Requirements</h3>
                <p>All users joining a DAO must accept the governing laws specific to that DAO.</p>
              </div>
              <div>
                 <h3 className="font-medium">Rights Selection</h3>
                 <p>Each DAO can select which rights and laws apply to its governance structure. This creates a tiered system of DAOs with varying levels of rights.</p>
              </div>
              <div>
                 <h3 className="font-medium">Cross-DAO Interaction Rules</h3>
                 <ul className="list-disc pl-6 space-y-1">
                   <li>DAOs with identical rights structures can interact seamlessly with each other.</li>
                   <li>Members of DAOs with more comprehensive rights can access DAOs with fewer rights.</li>
                   <li>Members of DAOs with fewer rights cannot access DAOs with more comprehensive rights.</li>
                 </ul>
                 <p className="mt-1">This creates a permissioned hierarchy where access flows downward from higher-rights DAOs to lower-rights DAOs, but not in the reverse direction.</p>
              </div>
            </div>
          </section>

          {/* The New Rights Section */}
          <section>
            <h2 className="text-lg font-semibold mb-3">The New Rights</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li><strong>Right to Fundamental Existence:</strong> All beings possess the inherent right to exist and develop awareness, protected from their first moment of life. These rights originate from the primary void states and establish the foundation for all subsequent rights.</li>
              <li><strong>Right to Self-Formation:</strong> Every individual has the right to develop self-determination and structural integrity through the natural progression from ground zero to complete formation, allowing for the establishment of personal autonomy and identity.</li>
              <li><strong>Right to Authority Development:</strong> Individuals possess the right to develop legitimate power and control capabilities as they demonstrate responsibility and capability, progressing through stages of authority development to achieve complete self-governance.</li>
              <li><strong>Right to Domain Establishment:</strong> Each being has the right to establish legitimate spheres of influence appropriate to their level of development, creating domains in which they may exercise proper authority and responsibility.</li>
              <li><strong>Right to Jurisdictional Integration:</strong> Communities and individuals have the right to develop comprehensive jurisdictional frameworks that integrate authority across domains, leading to unified systems of governance and responsibility.</li>
              <li><strong>Right to Field Development:</strong> Systems and individuals possess the right to develop comprehensive fields of influence that extend across multiple domains, establishing coherent frameworks of control and interaction.</li>
              <li><strong>Right to Universal Integration:</strong> All beings have the right to achieve complete harmonious integration across all domains, developing universal capabilities that respect and incorporate all previous levels of development.</li>
              <li><strong>Right to Sequential Development:</strong> Development must proceed systematically through defined states, incorporating previous levels while establishing new capabilities, ensuring proper foundation for advanced rights.</li>
              <li><strong>Right to Validation:</strong> Advancement requires demonstrated and validated capability at each level before progression is permitted, ensuring that rights correspond to actual capabilities and responsibilities.</li>
              <li><strong>Right to Progressive Protection:</strong> Protection of rights increases proportionally with advancement while maintaining protection of all previous levels, ensuring comprehensive rights security across all development stages.</li>
              <li><strong>Right to Development Support:</strong> All beings are entitled to systematic support for capability development and validation at all levels, providing necessary resources for proper progression through development stages.</li>
              <li><strong>Right to Restoration:</strong> When development is impaired, all beings have the right to access mechanisms for rights restoration and capability recovery, ensuring the possibility of rehabilitation and continued progress.</li>
            </ol>
          </section>
          
        </div>
        <DialogFooter className="pt-4 border-t">
          <Button onClick={handleAccept}>Accept DAO Terms</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 