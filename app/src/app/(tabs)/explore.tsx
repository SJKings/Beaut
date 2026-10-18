import { TextInput, View } from 'react-native';
import { Search } from '../../components/icons';
import { HStrip, Page } from '../../components/page';
import { Card, Chip, Stripes, T, textStyles } from '../../components/ui';
import { money } from '../../lib/data';
import { openService } from '../../lib/nav';
import { useCatalog, useStore } from '../../lib/store';
import { colors, fonts } from '../../lib/theme';

export default function Explore() {
  const { explore, setExplore } = useStore();
  const { services, cats } = useCatalog();
  const q = explore.q.trim().toLowerCase();
  const results = services.filter(
    (x) => (explore.cat === 'All' || x.cat === explore.cat) && (!q || x.name.toLowerCase().includes(q) || x.cat.toLowerCase().includes(q)),
  );

  return (
    <Page>
      <T w={600} style={textStyles.pageTitle}>
        Services
      </T>
      <View style={{ height: 50, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18 }}>
        <Search />
        <TextInput
          value={explore.q}
          onChangeText={(t) => setExplore({ q: t })}
          placeholder="Search services"
          placeholderTextColor={colors.placeholder}
          returnKeyType="search"
          style={{ flex: 1, fontSize: 15, fontFamily: fonts[400], color: colors.ink, paddingVertical: 0 }}
        />
      </View>
      <HStrip>
        {cats.map((c) => (
          <Chip key={c} label={c} selected={explore.cat === c} onPress={() => setExplore({ cat: c })} />
        ))}
      </HStrip>
      <T style={{ fontSize: 13, color: colors.muted }}>
        {results.length + (results.length === 1 ? ' service' : ' services')}
      </T>
      <View style={{ gap: 10 }}>
        {results.map((r) => (
          <Card key={r.id} onPress={() => openService(r.id)} style={{ flexDirection: 'row', gap: 14, alignItems: 'center', padding: 10, borderRadius: 20 }}>
            <Stripes radius={15} style={{ width: 70, height: 70 }} />
            <View style={{ flex: 1, gap: 3, minWidth: 0 }}>
              <T w={600} style={{ fontSize: 15 }}>
                {r.name}
              </T>
              <T style={{ fontSize: 13, color: colors.muted }}>
                {r.cat} · {r.dur} min
              </T>
              <T style={{ fontSize: 12 }}>
                ★ {r.rating} ({r.reviews})
              </T>
            </View>
            <T w={700} style={{ fontSize: 16, paddingRight: 6 }}>
              {money(r.price)}
            </T>
          </Card>
        ))}
      </View>
    </Page>
  );
}
