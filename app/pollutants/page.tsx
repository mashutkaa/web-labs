import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Pollutant } from "@/types/air-quality";

export const metadata = {
  title: "Довідник забруднювачів | ЕкоМонітор",
  description: "Референс для екологічних показників та стандартів ВООЗ",
};

export default function PollutantsGuide() {
  const pollutantsInfo = [
    {
      id: Pollutant.PM25,
      name: "Дрібнодисперсні частинки (PM2.5)",
      description:
        "Крихітні частинки або краплі в повітрі розміром два з половиною мікрони або менше. Вони можуть проникати глибоко в дихальні шляхи, досягаючи легенів.",
      sources:
        "Вихлопні гази транспорту, спалювання палива, лісові пожежі, промислові процеси.",
      healthEffects:
        "Респіраторні захворювання, серцево-судинні ускладнення, передчасна смерть.",
      limit: "15 мкг/м³ (річна середня), 35 мкг/м³ (24-годинна середня)",
      whoClass: "Клас 3 (помірна забруднення)",
    },
    {
      id: Pollutant.PM10,
      name: "Грубодисперсні частинки (PM10)",
      description:
        "Частинки, що вдихаються, з діаметром зазвичай 10 мікрометрів і менше. Проникають у верхні дихальні шляхи.",
      sources:
        "Дроблення та подрібнення, пил, піднятий транспортом на дорогах, промислові викиди.",
      healthEffects:
        "Дратування дихальних шляхів, обструкція дихання, бронхіальна астма.",
      limit: "20 мкг/м³ (річна середня), 50 мкг/м³ (24-годинна середня)",
      whoClass: "Клас 2 (помірна забруднення)",
    },
    {
      id: Pollutant.NO2,
      name: "Діоксид азоту (NO2)",
      description:
        "Високореактивний газ коричневого кольору, що швидко утворюється з викидів автомобілів, вантажівок, автобусів, електростанцій.",
      sources: "Спалювання палива, викиди транспорту, електростанції, промислові процеси.",
      healthEffects:
        "Дратування легень, зниження функції легень, підвищена сприйнятливість до респіраторних інфекцій.",
      limit: "40 мкг/м³ (річна середня), 200 мкг/м³ (1-годинна середня)",
      whoClass: "Клас 1 (хороша якість)",
    },
    {
      id: Pollutant.O3,
      name: "Озон (O3)",
      description:
        "Приземний озон не викидається безпосередньо в повітря, а утворюється в результаті хімічних реакцій між оксидами азоту та летючими органічними сполуками.",
      sources:
        "Утворюється вторинно під дією сонячного світла. Можна скоротити скороченням викидів NOx та ЛОС.",
      healthEffects:
        "Дратування дихальних шляхів, зниження функції легень, астма, хронічне обструктивне захворювання легень.",
      limit: "100 мкг/м³ (8-годинна, стандарт ВООЗ)",
      whoClass: "Клас 2 (помірна забруднення)",
    },
    {
      id: Pollutant.SO2,
      name: "Діоксид сірки (SO2)",
      description:
        "Безбарвний газ з характерним запахом, що утворюється переважно при спалюванні викопного палива, що містить сірку.",
      sources: "Електростанції, промислові підприємства, вулкани, гарячі джерела.",
      healthEffects:
        "Дратування дихальних шляхів, спазм бронхів, наростаюче запалення дихального тракту.",
      limit: "20 мкг/м³ (24-годинна середня), 500 мкг/м³ (10-хвилинна середня)",
      whoClass: "Клас 1 (хороша якість)",
    },
    {
      id: Pollutant.CO,
      name: "Чадний газ (CO)",
      description:
        "Безбарвний газ без запаху, який конкурує з киснем за молекули гемоглобіну, розглядаючи його, коли вдихається в великих кількостях.",
      sources: "Транспортні засоби та механізми, що спалюють викопне паливо, неповне згоряння.",
      healthEffects:
        "Зниження кисневої ємності крові, виснаження серцево-судинної системи, головні болі.",
      limit: "4 мг/м³ (8-годинна середня), 10 мг/м³ (1-годинна середня)",
      whoClass: "Клас 1 (хороша якість)",
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Довідник забруднювачів
        </h1>
        <p className="text-gray-500 mt-2">
          Детальна справочна інформація про контрольовані екологічні параметри
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Про якість повітря</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Якість повітря визначається присутністю шкідливих речовин, які можуть негативно вплинути на здоров&apos;я людей та стан довкілля.
            Всесвітня організація охорони здоров&apos;я (ВООЗ) встановила рекомендовані граничні значення для основних забруднювачів повітря.
          </p>
          <p className="text-gray-600">
            Цей проєкт контролює шість основних забруднювачів та обчислює Індекс Якості Повітря (ІЯП) на основі EPA методології.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pollutantsInfo.map((p) => (
          <Card key={p.id} className="h-full flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{p.name}</CardTitle>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-bold bg-gray-100 text-gray-800">
                  {p.id}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <p className="text-gray-600 mb-4">{p.description}</p>

              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Основні джерела
                  </h4>
                  <p className="text-sm text-gray-700 mt-1">{p.sources}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Вплив на здоров&apos;я
                  </h4>
                  <p className="text-sm text-gray-700 mt-1">{p.healthEffects}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Граничні значення (ВООЗ)
                  </h4>
                  <p className="text-sm font-medium text-emerald-600 mt-1">
                    {p.limit}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Індекс якості повітря (ІЯП)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            ІЯП це єдине число, яке повідомляє про те, наскільки чистим або забрудненим повітря.
            Він розраховується на основі концентрацій основних забруднювачів.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-semibold text-green-900">0-50: Добре</p>
              <p className="text-green-700">Якість повітря задовільна</p>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-semibold text-yellow-900">51-100: Помірна</p>
              <p className="text-yellow-700">Чутливі групи можуть відчути ефект</p>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="font-semibold text-orange-900">101-150: Нездорова</p>
              <p className="text-orange-700">Члени чутливих груп можуть відчути серйозні ефекти</p>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-semibold text-red-900">151-200: Дуже нездорова</p>
              <p className="text-red-700">Загальне населення може почати відчувати ефекти</p>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="font-semibold text-purple-900">201-300: Небезпечна</p>
              <p className="text-purple-700">Більшість людей почнуть відчувати серйозні ефекти</p>
            </div>
            <div className="p-3 bg-red-900 text-white rounded-lg">
              <p className="font-semibold">301+: Дуже небезпечна</p>
              <p className="text-red-200">Здоров&apos;я загальної популяції знаходиться під загрозою</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
