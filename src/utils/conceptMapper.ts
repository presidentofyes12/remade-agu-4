import { ConceptSystem } from '../contracts/deployments'
import { readContract } from 'wagmi/actions'
import { config } from '../config/wagmi'
import { computeTripartiteValue } from './math'
import { Address } from 'viem'

// Define ABI types
type ConceptMappingABI = typeof ConceptSystem.ConceptMapping.abi

interface ConceptDefinition {
  label: string
  description: string
  owner: Address
  lastUpdated: bigint
}

interface ValueWithMeaning {
  value: bigint
  label: string
  description: string
  components: {
    result: bigint
    first: bigint | null
    second: bigint | null
    third: bigint | null
  }
  owner: Address
  lastUpdated: bigint
}

export class ConceptMapper {
  private conceptDefinitions: Map<bigint, ConceptDefinition>
  private readonly ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as Address

  constructor() {
    this.conceptDefinitions = new Map()
  }

  /**
   * Validates the format of a concept definition
   */
  private validateDefinitionFormat(definition: unknown[]): asserts definition is [string, string, string, bigint] {
    if (!Array.isArray(definition) || definition.length < 4) {
      throw new Error('Invalid definition format: array length mismatch')
    }

    const [label, description, owner, lastUpdated] = definition

    if (typeof label !== 'string' || label.trim() === '') {
      throw new Error('Invalid definition: label must be a non-empty string')
    }

    if (typeof description !== 'string') {
      throw new Error('Invalid definition: description must be a string')
    }

    if (typeof owner !== 'string' || !owner.startsWith('0x')) {
      throw new Error('Invalid definition: owner must be a valid address')
    }

    if (typeof lastUpdated !== 'bigint') {
      throw new Error('Invalid definition: lastUpdated must be a bigint')
    }
  }

  /**
   * Fetches and caches a concept definition from the contract
   */
  async getDefinition(value: bigint): Promise<ConceptDefinition> {
    if (typeof value !== 'bigint') {
      throw new Error('Value must be a bigint')
    }

    // Check cache first
    const cached = this.conceptDefinitions.get(value)
    if (cached) {
      return cached
    }

    try {
      const definition = await readContract(config, {
        address: ConceptSystem.ConceptMapping.address,
        abi: ConceptSystem.ConceptMapping.abi as unknown as readonly unknown[],
        functionName: 'getDefinition',
        args: [value],
      })

      this.validateDefinitionFormat(definition as unknown[])

      const [label, description, owner, lastUpdated] = definition as [string, string, string, bigint]

      const conceptDef: ConceptDefinition = {
        label: label.trim(),
        description: description.trim(),
        owner: owner as Address,
        lastUpdated,
      }

      // Cache the definition
      this.conceptDefinitions.set(value, conceptDef)
      return conceptDef
    } catch (error) {
      console.error('Error fetching concept definition:', error)
      return {
        label: '',
        description: '',
        owner: this.ZERO_ADDRESS,
        lastUpdated: 0n,
      }
    }
  }

  /**
   * Gets a value with its semantic meaning and tripartite components
   */
  async getValueWithMeaning(value: bigint): Promise<ValueWithMeaning> {
    if (typeof value !== 'bigint') {
      throw new Error('Value must be a bigint')
    }

    try {
      const definition = await this.getDefinition(value)
      const components = computeTripartiteValue(value)

      return {
        value,
        label: definition.label,
        description: definition.description,
        components,
        owner: definition.owner,
        lastUpdated: definition.lastUpdated,
      }
    } catch (error) {
      console.error('Error getting value with meaning:', error)
      return {
        value,
        label: '',
        description: '',
        components: {
          result: value,
          first: null,
          second: null,
          third: null,
        },
        owner: this.ZERO_ADDRESS,
        lastUpdated: 0n,
      }
    }
  }

  /**
   * Evaluates if a value aligns with a given intent
   */
  async evaluateAlignment(value: bigint, intent: string): Promise<boolean> {
    if (typeof value !== 'bigint') {
      throw new Error('Value must be a bigint')
    }

    if (typeof intent !== 'string' || intent.trim() === '') {
      throw new Error('Intent must be a non-empty string')
    }

    try {
      const valueWithMeaning = await this.getValueWithMeaning(value)
      
      // Simple semantic matching - can be enhanced based on requirements
      const normalizedIntent = intent.toLowerCase().trim()
      return (
        valueWithMeaning.label.toLowerCase().includes(normalizedIntent) ||
        valueWithMeaning.description.toLowerCase().includes(normalizedIntent)
      )
    } catch (error) {
      console.error('Error evaluating alignment:', error)
      return false
    }
  }

  /**
   * Gets all known concept definitions
   */
  async getAllDefinitions(): Promise<Map<bigint, ConceptDefinition>> {
    try {
      const count = await readContract(config, {
        address: ConceptSystem.ConceptMapping.address,
        abi: ConceptSystem.ConceptMapping.abi as unknown as readonly unknown[],
        functionName: 'getDefinitionCount',
      })

      if (typeof count !== 'bigint' && typeof count !== 'string') {
        throw new Error('Invalid count format')
      }

      const countBigInt = typeof count === 'string' ? BigInt(count) : count

      for (let i = 0n; i < countBigInt; i++) {
        try {
          const definition = await readContract(config, {
            address: ConceptSystem.ConceptMapping.address,
            abi: ConceptSystem.ConceptMapping.abi as unknown as readonly unknown[],
            functionName: 'getDefinitionByIndex',
            args: [i],
          })

          this.validateDefinitionFormat(definition as unknown[])

          const [value, label, description, owner, lastUpdated] = definition as [string | bigint, string, string, string, bigint]
          const valueBigInt = typeof value === 'string' ? BigInt(value) : value

          const conceptDef: ConceptDefinition = {
            label: label.trim(),
            description: description.trim(),
            owner: owner as Address,
            lastUpdated,
          }

          this.conceptDefinitions.set(valueBigInt, conceptDef)
        } catch (error) {
          console.error(`Error fetching definition at index ${i}:`, error)
          // Continue with next definition
          continue
        }
      }

      return this.conceptDefinitions
    } catch (error) {
      console.error('Error fetching all definitions:', error)
      return this.conceptDefinitions
    }
  }
} 