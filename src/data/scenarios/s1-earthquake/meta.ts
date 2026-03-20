import { type ScenarioMeta } from '../../../types'

export const s1Meta: ScenarioMeta = {
  id: 'S1',
  title: '地震',
  subtitle: '花東大地震',
  introText: `凌晨 2:30。\n\n你從睡夢中被劇烈搖晃驚醒。\n\n整棟公寓像是被巨人抓住猛力搖動，\n玻璃碎裂聲、家具倒塌聲此起彼落。\n\n規模 7.2。\n\n這是你這輩子遭遇過最大的地震。\n\n接下來的每一個選擇，都攸關生死。`,
  difficulty: 3,
  phaseNames: ['地震發生當下', '地震後 0～2 小時', '地震後 2～24 小時', '地震後 24 小時以上'],
}
